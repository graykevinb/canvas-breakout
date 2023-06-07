import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {

  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef;


  ngAfterViewInit(): void {
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

    if (context) {
      context.fillStyle = 'white'
      const height = 3;
      context.fillRect(canvas.width/2, canvas.height - height - 5, 50, height);
      window.addEventListener("mousemove", (event) => this.updatePos(event, canvas, context))
    }
  }

  updatePos(event: MouseEvent, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    console.log(event.screenX, event.screenY);
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white'
    const height = 3;
    const width = 50;
    const newX = event.screenX / 5 + width/2;
    context.fillRect(newX, canvas.height - height - 5, width, height);
  }
}
