import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-progress-indicator',
  template: `
    <!--<div class="progress-container">
      <mat-progress-bar mode="determinate" [value]="(current / total) * 100">
      </mat-progress-bar>
      <div class="progress-text">
        Processing chunk {{ current }} of {{ total }}
      </div>
    </div>-->

    <div class="progress-container">
      <div
        class="progress-bar"
        [style.width.%]="((currentChunk + 1) / totalChunks) * 100"
      >
        Chunk {{ currentChunk + 1 }} of {{ totalChunks }}
      </div>
      <div class="chunk-nav">
        <button (click)="previousChunk()" [disabled]="currentChunk === 0">
          Previous
        </button>
        <button
          (click)="nextChunk()"
          [disabled]="currentChunk === totalChunks - 1"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .progress-container {
        margin: 2rem 0;
      }
      .progress-text {
        text-align: center;
        margin-top: 0.5rem;
        color: #666;
      }
    `,
  ],
  standalone: false,
})
export class ProgressIndicatorComponent {
  @Input() currentChunk!: number;
  @Input() totalChunks!: number;
  @Output() chunkChange = new EventEmitter<number>();

  previousChunk() {
    this.chunkChange.emit(this.currentChunk - 1);
  }

  nextChunk() {
    this.chunkChange.emit(this.currentChunk + 1);
  }
}
