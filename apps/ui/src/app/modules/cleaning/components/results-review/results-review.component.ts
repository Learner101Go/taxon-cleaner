// // apps/cleaning-tool/src/app/modules/cleaning/components/results-review/results-review.component.ts

// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

// @Component({
//   selector: 'app-results-review',
//   template: `
//     <div class="review-container">
//       <h2>Cleaning Summary</h2>

//       <!-- Statistics Overview -->
//       <div class="stats-grid">
//         <div class="stat-card">
//           <h3>Total Records</h3>
//           <p>{{ totalRecords }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>Issues Found</h3>
//           <p>{{ totalIssues }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>Auto-Corrected</h3>
//           <p>{{ autoCorrected }}</p>
//         </div>
//       </div>

//       <!-- Chunk Navigation -->
//       <div class="chunk-navigation">
//         <button mat-icon-button (click)="previousChunk()">
//           <mat-icon>chevron_left</mat-icon>
//         </button>
//         <span>Chunk {{ currentChunk + 1 }} of {{ totalChunks }}</span>
//         <button mat-icon-button (click)="nextChunk()">
//           <mat-icon>chevron_right</mat-icon>
//         </button>
//       </div>

//       <!-- Final Actions -->
//       <div class="final-actions">
//         <button mat-raised-button color="primary" (click)="saveToDatabase()">
//           Save to Database
//         </button>
//         <button mat-raised-button (click)="downloadResults()">
//           Download Cleaned Data
//         </button>
//         <button mat-button (click)="startNewSession()">
//           New Cleaning Session
//         </button>
//       </div>
//     </div>
//   `,
//   standalone: false,
// })
// export class ResultsReviewComponent {
//   totalRecords = 0;
//   totalIssues = 0;
//   autoCorrected = 0;
//   currentChunk = 0;
//   totalChunks = 0;

//   constructor(
//     private cleaningService: CleaningService,
//     private router: Router
//   ) {}

//   saveToDatabase(): void {
//     this.cleaningService.finalizeJob().subscribe({
//       next: () => this.router.navigate(['/success']),
//       error: (err: any) => console.error('Save failed', err),
//     });
//   }

//   downloadResults(): void {
//     this.cleaningService.exportResults().subscribe((blob: any) => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `cleaned-data-${Date.now()}.json`;
//       a.click();
//     });
//   }

//   previousChunk() {
//     if (this.currentChunk > 0) this.currentChunk--;
//   }

//   nextChunk() {
//     if (this.currentChunk < this.totalChunks - 1) this.currentChunk++;
//   }

//   startNewSession() {
//     window.location.reload(); // Or your reset logic
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
import {
  CleaningResult,
  JobProgress,
} from 'apps/ui/src/app/core/models/data.models';

@Component({
  selector: 'app-results-review',
  template: `
    <div class="review-container">
      <h2>Cleaning Summary</h2>
      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading results...</p>
      </div>
      <ng-container *ngIf="!loading && progress">
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

        <div class="chunk-navigation">
          <button
            mat-icon-button
            (click)="previousChunk()"
            [disabled]="currentChunkIndex === 0"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span>Chunk {{ currentChunkIndex + 1 }} of {{ totalChunks }}</span>
          <button
            mat-icon-button
            (click)="nextChunk()"
            [disabled]="currentChunkIndex === totalChunks - 1"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Display current chunk records -->
        <div
          *ngIf="currentChunk && currentChunk.length > 0"
          class="records-list"
        >
          <div class="record-card" *ngFor="let record of currentChunk">
            <div>
              <strong>Original:</strong> {{ record.original.scientificName }}
            </div>
            <div>
              <strong>Accepted:</strong>
              {{ record.accepted?.scientificName || '-' }}
            </div>
            <div>
              <strong>Issues:</strong>
              <span *ngFor="let issue of record.issues">
                {{ issue.message }}
              </span>
            </div>
          </div>
        </div>

        <div
          *ngIf="currentChunk && currentChunk.length === 0"
          class="empty-chunk"
        >
          No records in this chunk.
        </div>

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
      </ng-container>
    </div>
  `,
  standalone: false,
})
export class ResultsReviewComponent implements OnInit {
  totalRecords = 0;
  totalIssues = 0;
  autoCorrected = 0;
  currentChunkIndex = 0;
  totalChunks = 0;

  progress: JobProgress | null = null;
  currentChunk: CleaningResult[] = [];
  jobId: string | null = null;
  loading = true;

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get jobId from router state
    const nav = this.router.getCurrentNavigation();
    this.jobId = nav?.extras?.state?.['jobId'] || null;

    if (!this.jobId) {
      // fallback: redirect to dashboard or error
      this.router.navigate(['/']);
      return;
    }

    this.fetchResults();
  }

  fetchResults() {
    this.loading = true;
    this.cleaningService.getJobProgress(this.jobId!).subscribe({
      next: (progress) => {
        this.progress = progress;
        this.totalChunks = progress.totalChunks;
        this.currentChunkIndex = 0;
        this.updateStatsAndChunk();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.progress = null;
      },
    });
  }

  updateStatsAndChunk() {
    if (!this.progress) return;
    const allRecords = (this.progress.chunks || [])
      .flat()
      .filter(Boolean) as CleaningResult[];

    this.totalRecords = allRecords.length;
    this.totalIssues = allRecords.reduce(
      (sum, rec) => sum + (rec.issues?.length || 0),
      0
    );
    this.autoCorrected = allRecords.filter(
      (rec) => rec.metadata?.autoApplied
    ).length;

    // Update current chunk
    this.currentChunk = (this.progress.chunks?.[this.currentChunkIndex] ||
      []) as CleaningResult[];
  }

  previousChunk() {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.updateStatsAndChunk();
    }
  }

  nextChunk() {
    if (this.currentChunkIndex < this.totalChunks - 1) {
      this.currentChunkIndex++;
      this.updateStatsAndChunk();
    }
  }

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

  startNewSession() {
    window.location.reload();
  }
}
