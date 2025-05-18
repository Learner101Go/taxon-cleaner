// apps/cleaning-tool/src/app/modules/cleaning/components/results-review/results-review.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

@Component({
  selector: 'app-results-review',
  template: `
    <div class="review-container">
      <h2>Cleaning Summary</h2>

      <!-- Statistics Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Records</h3>
          <p>{{ totalRecords }}</p>
        </div>
        <div class="stat-card">
          <h3>Issues Found</h3>
          <p>{{ totalIssues }}</p>
        </div>
        <div class="stat-card">
          <h3>Auto-Corrected</h3>
          <p>{{ autoCorrected }}</p>
        </div>
      </div>

      <!-- Chunk Navigation -->
      <div class="chunk-navigation">
        <button mat-icon-button (click)="previousChunk()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span>Chunk {{ currentChunk + 1 }} of {{ totalChunks }}</span>
        <button mat-icon-button (click)="nextChunk()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Final Actions -->
      <div class="final-actions">
        <button mat-raised-button color="primary" (click)="saveToDatabase()">
          Save to Database
        </button>
        <button mat-raised-button (click)="downloadResults()">
          Download Cleaned Data
        </button>
        <button mat-button (click)="startNewSession()">
          New Cleaning Session
        </button>
      </div>
    </div>
  `,
  standalone: false,
})
export class ResultsReviewComponent {
  totalRecords = 0;
  totalIssues = 0;
  autoCorrected = 0;
  currentChunk = 0;
  totalChunks = 0;

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  saveToDatabase(): void {
    this.cleaningService.finalizeJob().subscribe({
      next: () => this.router.navigate(['/success']),
      error: (err: any) => console.error('Save failed', err),
    });
  }

  downloadResults(): void {
    this.cleaningService.exportResults().subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaned-data-${Date.now()}.json`;
      a.click();
    });
  }

  previousChunk() {
    if (this.currentChunk > 0) this.currentChunk--;
  }

  nextChunk() {
    if (this.currentChunk < this.totalChunks - 1) this.currentChunk++;
  }

  startNewSession() {
    window.location.reload(); // Or your reset logic
  }
}
