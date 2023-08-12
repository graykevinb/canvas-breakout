import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements AfterViewInit {

  @ViewChild('paddleCanvas', { static: false }) paddleCanvasRef!: ElementRef;
  @ViewChild('ballCanvas', { static: false }) ballCanvasRef!: ElementRef;

  PADDLE_HEIGHT = 20;
  PADDLE_WIDTH = 300;
  PADDLE_Y = 0;
  PADDLE_X = 0;

  ballX = 30;
  ballY = 30;

  ballXSpeed = 5;
  ballYSpeed = 5;

  canvasWidth = 0;
  canvasHeight = 0;


  ngAfterViewInit(): void {
    const paddleCanvas: any = this.paddleCanvasRef.nativeElement;

    const ballCanvas: any = this.ballCanvasRef.nativeElement;

    const dpr = window.devicePixelRatio || 1;

    const bsr = paddleCanvas.webkitBackingStorePixelRatio || paddleCanvas.mozBackingStorePixelRatio ||
      paddleCanvas.msBackingStorePixelRatio || paddleCanvas.oBackingStorePixelRatio ||
      paddleCanvas.backingStorePixelRatio || 1;
    
    const ratio = dpr / bsr;
    const rect = paddleCanvas.getBoundingClientRect();
    this.canvasWidth = rect.width;

    this.canvasHeight = rect.height;
    
    const width = rect.width * ratio;
    const height = rect.height * ratio;

    ballCanvas.width = width;
    ballCanvas.height = height;

    paddleCanvas.width = width;
    paddleCanvas.height = height;

    const ballCtx: CanvasRenderingContext2D | null = ballCanvas.getContext('2d');
    const paddleCtx: CanvasRenderingContext2D | null = paddleCanvas.getContext('2d');
    paddleCtx?.scale(ratio, ratio);
    ballCtx?.scale(ratio, ratio);

    paddleCanvas.style.width = rect.width + 'px';
    paddleCanvas.style.height = rect.height + 'px';

    ballCanvas.style.width = rect.width + 'px';
    ballCanvas.style.height = rect.height + 'px';

    this.PADDLE_Y = this.canvasHeight - this.PADDLE_HEIGHT;

    if (paddleCtx && ballCtx) {
      paddleCtx.fillStyle = 'white';
      window.addEventListener("mousemove", (event) => this.updatePaddlePos(event, paddleCanvas, paddleCtx));
      //setInterval(() => this.updateBallPos(ballCanvas, ballCtx), 1);
      window.requestAnimationFrame(() => this.updateBallPos(ballCanvas, ballCtx));
    }
  }

  

  updateBallPos(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    const radius = 20;
    
    if((this.ballY >= this.canvasHeight - this.PADDLE_HEIGHT - radius) && this.ballX >= this.PADDLE_X && this.ballX <= this.PADDLE_X + this.PADDLE_WIDTH) {
      console.log("hit paddle at: ");
      this.ballYSpeed = -this.ballYSpeed;
    } else if(this.ballY + radius >= this.canvasHeight) {
      //  console.log("Game Over!");
      this.ballXSpeed = 0;
      this.ballYSpeed = 0;
    } else if(this.ballX + radius >= this.canvasWidth || this.ballX - radius <= 0) {
      this.ballXSpeed = -this.ballXSpeed;
    } else if(this.ballY - radius <= 0) {
      this.ballYSpeed = -this.ballYSpeed;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.fillStyle = 'white';
  
    this.ballX += this.ballXSpeed;
    this.ballY += this.ballYSpeed;
    context.arc(this.ballX, this.ballY, radius, 0, 2*Math.PI);
    context.fill()
    window.requestAnimationFrame(() => this.updateBallPos(canvas, context));
  }

  updatePaddlePos(event: MouseEvent, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    context.fillStyle = 'white'
    const newX = Math.floor(event.clientX);
    this.PADDLE_X = newX;
    context.fillRect(newX, this.PADDLE_Y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
    console.log("paddle:", this.PADDLE_Y)
  }
}
