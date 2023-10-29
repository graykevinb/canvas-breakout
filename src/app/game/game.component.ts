import { NgIfContext } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements AfterViewInit {

  @ViewChild('pongCanvas', { static: false }) ballCanvasRef!: ElementRef;
  pongCanvas: any = undefined;

  canvasWidth!: number;
  canvasHeight!: number;

  GAMEOVER = false;
  WON = false;

  bricks!: Bricks;
  paddle!: Paddle;
  ball!: Ball;

  ngAfterViewInit(): void {

    this.pongCanvas = this.ballCanvasRef.nativeElement;

    this.canvasWidth = this.pongCanvas.getBoundingClientRect().width;
    this.canvasHeight = this.pongCanvas.getBoundingClientRect().height;

    this.bricks = new Bricks(3,10, this.canvasWidth);


    this.ball = new Ball(this.canvasWidth/2, this.canvasHeight/2);

    this.paddle = new Paddle(this.canvasWidth/2, this.canvasHeight-Paddle.PADDLE_HEIGHT);
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
    if (!this.GAMEOVER && !this.bricks.empty()) {


      this.updateBallPos();

      let b_list: Array<Brick> = this.bricks.bricks;
      let i: any;
      for (i in b_list) {
        const brick = b_list[i];
        let vector = brick.collide(this.ball.x, this.ball.y, this.ball.radius);
        this.ball.xSpeed *= vector[0];
        this.ball.ySpeed *= vector[1];
        if(!brick.broken) {
          brick.draw(context);
        } else {
          brick.clear(context);
        }
      }
      // Draw Ball
      this.ball.draw(context);
      //context.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2*Math.PI);

      //Update paddle position
      this.paddle.draw(context);
      context.fill();

      window.requestAnimationFrame(() => this.updateGame(canvas, context));
    } else if(this.GAMEOVER) {
      context.font = "200px mono";
      context.textAlign = "center";
      context.fillText("GAMEOVER!", this.canvasWidth/2, this.canvasHeight/2);
    } else if(this.bricks.empty()) {
      context.font = "200px mono";
      context.textAlign = "center";
      context.fillText("YOU WON!", this.canvasWidth/2, this.canvasHeight/2);
    }
  }

  private updateBallPos() {
    const radius = this.ball.radius;

    if ((this.ball.y >= this.paddle.y - Paddle.PADDLE_HEIGHT - 0.5*radius) && 
        this.ball.x >= this.paddle.x && 
        this.ball.x <= this.paddle.x + Paddle.PADDLE_WIDTH) {
      //return
      this.ball.ySpeed = -this.ball.ySpeed;
    } else if (this.ball.y + radius >= this.canvasHeight) {
      this.ball.xSpeed = 0;
      this.ball.ySpeed = 0;
      this.GAMEOVER = true;
    } else if (this.ball.x + radius >= this.canvasWidth || this.ball.x - radius <= 0) {
      this.ball.xSpeed = -this.ball.xSpeed;
    } else if (this.ball.y - radius <= 0) {
      this.ball.ySpeed = -this.ball.ySpeed;
    }
    this.ball.x += this.ball.xSpeed;
    this.ball.y += this.ball.ySpeed;
  }

  updatePaddlePos(event: MouseEvent) {
    this.paddle.x = Math.floor(event.clientX);
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
    for (let r=0;r<=rows-1;r++) {
      for (let c=0;c<=cols-1;c++) {
        this.bricks.push(new Brick(c*(this.width+padding), r*(this.height+padding), this.width, this.height))
      }
    }

  }

  empty(): boolean {
    let count = 0;
    for (let b in this.bricks) {
      if(!this.bricks[b].broken) {
        count += 1;
      }
    }

    return count === 0;
  }
}

abstract class Sprite {
  x!: number;
  y!: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  abstract draw(ctx: CanvasRenderingContext2D): void;
}


class Ball extends Sprite {
  radius = 20;
  xSpeed = 10;
  ySpeed = 10;

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
  }
}


class Paddle extends Sprite {
  static PADDLE_HEIGHT = 20;
  static PADDLE_WIDTH = 300;

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.rect(this.x, this.y, Paddle.PADDLE_WIDTH, Paddle.PADDLE_HEIGHT);
  }
}


class Brick extends Sprite {
  width;
  height;
  broken = false;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y);
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

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.rect(this.x, this.y, this.width, this.height)
  }

  clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(this.x, this.y, this.width, this.height)
  }
}