import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements AfterViewInit {

  @ViewChild('pongCanvas', { static: false }) ballCanvasRef!: ElementRef;
  pongCanvas: any = this.ballCanvasRef.nativeElement;

  canvasWidth = this.pongCanvas.getBoundingClientRect().width;
  canvasHeight = this.pongCanvas.getBoundingClientRect().height;

  PADDLE_HEIGHT = 20;
  PADDLE_WIDTH = 300;
  PADDLE_Y = this.canvasHeight - this.PADDLE_HEIGHT;
  PADDLE_X = 0;

  ballX = 30;
  ballY = 30;

  ballXSpeed = 10;
  ballYSpeed = 10;

  ngAfterViewInit(): void {

    const dpr = window.devicePixelRatio || 1;
  
    this.pongCanvas.width = this.canvasWidth * dpr;
    this.pongCanvas.height = this.canvasHeight * dpr;

    const ballCtx: CanvasRenderingContext2D | null = this.pongCanvas.getContext('2d');

    ballCtx?.scale(dpr, dpr);

    this.pongCanvas.style.width = this.canvasWidth + 'px';
    this.pongCanvas.style.height = this.canvasHeight + 'px';

    if (ballCtx) {
      ballCtx.fillStyle = 'white';
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
