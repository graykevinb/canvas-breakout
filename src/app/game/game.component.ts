import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements AfterViewInit {

  @ViewChild('pongCanvas', { static: false }) ballCanvasRef!: ElementRef;

  PADDLE_HEIGHT = 20;
  PADDLE_WIDTH = 300;
  PADDLE_Y = 0;
  PADDLE_X = 0;

  ballX = 30;
  ballY = 30;

  ballXSpeed = 10;
  ballYSpeed = 10;

  canvasWidth = 0;
  canvasHeight = 0;


  ngAfterViewInit(): void {

    const pongCanvas: any = this.ballCanvasRef.nativeElement;

    const dpr = window.devicePixelRatio || 1;

    const bsr = pongCanvas.webkitBackingStorePixelRatio || 
      pongCanvas.mozBackingStorePixelRatio ||
      pongCanvas.msBackingStorePixelRatio || 
      pongCanvas.oBackingStorePixelRatio ||  
      pongCanvas.backingStorePixelRatio || 1;
    
    const ratio = dpr / bsr;

    this.canvasWidth = pongCanvas.getBoundingClientRect().width;
    this.canvasHeight = pongCanvas.getBoundingClientRect().height;
  
    pongCanvas.width = this.canvasWidth * ratio;
    pongCanvas.height = this.canvasHeight * ratio;

    const ballCtx: CanvasRenderingContext2D | null = pongCanvas.getContext('2d');

    ballCtx?.scale(ratio, ratio);

    pongCanvas.style.width = this.canvasWidth + 'px';
    pongCanvas.style.height = this.canvasHeight + 'px';

    this.PADDLE_Y = this.canvasHeight - this.PADDLE_HEIGHT;

    if (ballCtx) {
      ballCtx.fillStyle = 'white';
      window.addEventListener("mousemove", (event) => this.updatePaddlePos(event));
      window.requestAnimationFrame(() => this.updateGame(pongCanvas, ballCtx));
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
