import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  template: `
    <div *ngIf="errors.length" class="error-container">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <div class="error-list">
        <div *ngFor="let error of errors" class="error-item">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        padding: 1rem;
        background: #fee;
        border: 1px solid #f99;
        border-radius: 4px;
        display: flex;
        align-items: center;
        margin: 1rem 0;
      }
      .error-icon {
        color: #d00;
        margin-right: 1rem;
      }
      .error-item {
        margin: 0.25rem 0;
      }
    `,
  ],
  standalone: false,
})
export class ErrorAlertComponent {
  @Input() errors: string[] = [];
}
