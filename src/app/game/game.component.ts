import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements AfterViewInit {

  @ViewChild('pongCanvas', { static: false }) ballCanvasRef!: ElementRef;
  pongCanvas: any = undefined;

  canvasWidth = 0
  canvasHeight = 0

  PADDLE_HEIGHT = 20;
  PADDLE_WIDTH = 300;
  PADDLE_Y = 0;
  PADDLE_X = 0;

  ballX = 0;
  ballY = 0;

  ballXSpeed = 10;
  ballYSpeed = 10;

  bricks!: Bricks;

  ngAfterViewInit(): void {

    this.pongCanvas = this.ballCanvasRef.nativeElement;

    this.canvasWidth = this.pongCanvas.getBoundingClientRect().width;
    this.canvasHeight = this.pongCanvas.getBoundingClientRect().height;

    this.bricks = new Bricks(3, 10, this.canvasWidth);
  
    this.PADDLE_Y = this.canvasHeight - this.PADDLE_HEIGHT;

    this.ballX = this.canvasWidth/2;
    this.ballY = this.canvasHeight/2;
  
    const dpr = window.devicePixelRatio || 1;
  
    this.pongCanvas.width = this.canvasWidth * dpr;
    this.pongCanvas.height = this.canvasHeight * dpr;

    const ballCtx: CanvasRenderingContext2D | null = this.pongCanvas.getContext('2d');

    ballCtx?.scale(dpr, dpr);

    this.pongCanvas.style.width = this.canvasWidth + 'px';
    this.pongCanvas.style.height = this.canvasHeight + 'px';

    if (ballCtx) {
      window.addEventListener("mousemove", (event) => this.updatePaddlePos(event));
      window.requestAnimationFrame(() => this.updateGame(this.pongCanvas, ballCtx));
    }

  }

  updateGame(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    // Setup Canvas for drawing
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.fillStyle = 'white';

    const radius = 20;
    this.updateBallPos(radius);

    let b_list: Array<Brick> = this.bricks.bricks;
    let i: any;
    for (i in b_list) {
      const brick = b_list[i];
      let vector = brick.collide(this.ballX, this.ballY, radius);
      this.ballXSpeed *= vector[0];
      this.ballYSpeed *= vector[1];
      if(!brick.broken) {
        brick.draw(context);
      } else {
        brick.clear(context);
      }
    }
    // Draw Ball
    context.arc(this.ballX, this.ballY, radius, 0, 2*Math.PI);

    //Update paddle position
    context.rect(this.PADDLE_X, this.PADDLE_Y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    context.fill();

    window.requestAnimationFrame(() => this.updateGame(canvas, context));
  }

  private updateBallPos(radius: number) {
    if ((this.ballY >= this.canvasHeight - this.PADDLE_HEIGHT - radius) && 
        this.ballX >= this.PADDLE_X && 
        this.ballX <= this.PADDLE_X + this.PADDLE_WIDTH) {
      this.ballYSpeed = -this.ballYSpeed;
    } else if (this.ballY + radius >= this.canvasHeight) {
      this.ballXSpeed = 0;
      this.ballYSpeed = 0;
    } else if (this.ballX + radius >= this.canvasWidth || this.ballX - radius <= 0) {
      this.ballXSpeed = -this.ballXSpeed;
    } else if (this.ballY - radius <= 0) {
      this.ballYSpeed = -this.ballYSpeed;
    }
    this.ballX += this.ballXSpeed;
    this.ballY += this.ballYSpeed;
  }

  updatePaddlePos(event: MouseEvent) {
    this.PADDLE_X = Math.floor(event.clientX);
  }
}

class Bricks {
  bricks: Array<Brick>;
  width = 100;
  height = 50;

  constructor(rows: number, cols: number, gameWidth: number) {
    const padding = 10;
    this.width = gameWidth/cols - padding;
    this.bricks = [];
    for (let r=0;r<=rows;r++) {
      for (let c=0;c<=cols;c++) {
        this.bricks.push(new Brick(c*(this.width+padding), r*(this.height+padding), this.width, this.height))
      }
    } 
  }
}


class Brick {
  x: number;
  y: number;
  width;
  height;
  broken = false;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y =y;
    this.width = width;
    this.height = height;
  }

  collide(ballX: number, ballY: number, radius: number): [number, number] {
    const bottomY = this.y+ this.height;
    const rightX = this.x + this.width;
    if (!this.broken && (ballX + radius >= this.x) && (ballX - radius <= rightX) && (ballY + radius >= this.y) && (ballY - radius <= bottomY)) {
      this.broken = true;
      
      if (((ballX + radius >= this.x) &&  (ballX - radius < rightX)) || ((ballX + radius > this.x) &&  (ballX - radius <= rightX))) {
        return [1, -1];
      } else if(((ballY + radius >= this.y) && (ballY - radius <= bottomY)) || ((ballY + radius >= this.y) && (ballY - radius <= bottomY))) {
        return [-1, 1];      
      }
      return [-1, -1];
    }
    return [1, 1];
  }

  draw(ctx: any) {
    ctx.rect(this.x, this.y, this.width, this.height)
  }

  clear(ctx: any) {
    ctx.clearRect(this.x, this.y, this.width, this.height)
  }
}