import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-anim',
  templateUrl: './anim.component.html',
  styleUrls: ['./anim.component.scss']
})
export class AnimComponent implements AfterViewInit {

  @ViewChild('canvasElement')
  private canvasElement?: ElementRef;
  private context?: CanvasRenderingContext2D;

  public ngAfterViewInit(): void {
    this.context = this.canvasElement?.nativeElement.getContext('2d');
    this.draw();
  }

  /**
  * Draws something using the context we obtained earlier on
  */
  private draw() {
    if (!this.context) throw new Error('context doesnt exist');
    this.context.font = "30px Arial";
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    
    if (!this.canvasElement) throw new Error('canvas doesnt exist');
    const x = (this.canvasElement.nativeElement as HTMLCanvasElement).width / 2;
    const y = (this.canvasElement.nativeElement as HTMLCanvasElement).height / 2;
    this.context.fillText("@realappie", x, y);
  }

}
