// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
// import {
//   CleaningResult,
//   JobProgress,
// } from 'apps/ui/src/app/core/models/data.models';
// import { tap } from 'rxjs';

// @Component({
//   selector: 'app-results-review',
//   templateUrl: './results-review.component.html',
//   styleUrls: ['./results-review.component.scss'],
//   standalone: false,
// })
// export class ResultsReviewComponent implements OnInit {
//   totalRecords = 0;
//   totalIssues = 0;
//   autoCorrected = 0;
//   currentChunkIndex = 0;
//   totalChunks = 0;

//   progress: JobProgress | null = null;
//   currentChunk: CleaningResult[] = [];
//   jobIds: string[] = [];
//   primaryJobId: string | null = null;
//   loading = true;

//   constructor(
//     private cleaningService: CleaningService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     // Get job information from router state
//     const nav = this.router.getCurrentNavigation();
//     const state = nav?.extras?.state || history.state;

//     this.primaryJobId = state?.['primaryJobId'] || state?.['jobId'] || null;
//     this.jobIds =
//       state?.['jobIds'] || (this.primaryJobId ? [this.primaryJobId] : []);

//     console.log('Results component initialized with:', {
//       primaryJobId: this.primaryJobId,
//       jobIds: this.jobIds,
//     });

//     if (!this.primaryJobId) {
//       console.error('No job ID found, redirecting to dashboard');
//       this.router.navigate(['/']);
//       return;
//     }

//     this.fetchResults();
//   }

//   fetchResults() {
//     this.loading = true;
//     this.cleaningService.getJobProgress(this.primaryJobId!).subscribe({
//       next: (progress) => {
//         console.log('Fetched results progress:', progress);
//         this.progress = progress;
//         this.totalChunks = progress.totalChunks;
//         this.currentChunkIndex = 0;
//         this.updateStatsAndChunk();
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error fetching results:', error);
//         this.loading = false;
//         this.progress = null;
//       },
//     });
//   }

//   updateStatsAndChunk() {
//     if (!this.progress) return;

//     // Get all completed chunks and flatten them
//     const allRecords = (this.progress.chunks || [])
//       .filter((chunk) => chunk !== null && Array.isArray(chunk))
//       .flat() as CleaningResult[];

//     console.log('Processing stats for', allRecords.length, 'total records');

//     this.totalRecords = allRecords.length;
//     this.totalIssues = allRecords.reduce(
//       (sum, rec) => sum + (rec.issues?.length || 0),
//       0
//     );
//     this.autoCorrected = allRecords.filter((rec) =>
//       this.hasCorrections(rec)
//     ).length;

//     // Update current chunk - ensure it's valid
//     const chunkData = this.progress.chunks?.[this.currentChunkIndex];
//     this.currentChunk = (
//       Array.isArray(chunkData) ? chunkData : []
//     ) as CleaningResult[];

//     console.log(
//       'Current chunk',
//       this.currentChunkIndex,
//       'has',
//       this.currentChunk.length,
//       'records'
//     );
//   }

//   hasCorrections(record: CleaningResult): boolean {
//     if (!record.accepted) return false;

//     const original = record.original;
//     const accepted = record.accepted;

//     return (
//       original.scientificName !== accepted.scientificName ||
//       original.scientificNameAuthorship !== accepted.scientificNameAuthorship ||
//       original.decimalLatitude !== accepted.decimalLatitude ||
//       original.decimalLongitude !== accepted.decimalLongitude ||
//       original.family !== accepted.family
//     );
//   }

//   getIssueMessages(issues: any[]): string {
//     return issues?.map((issue) => issue.message).join(', ') || '';
//   }

//   getChunkIssues(): number {
//     return this.currentChunk.reduce(
//       (total, record) => total + (record.issues?.length || 0),
//       0
//     );
//   }

//   getChunkCorrections(): number {
//     return this.currentChunk.filter((record) => this.hasCorrections(record))
//       .length;
//   }

//   previousChunk() {
//     if (this.currentChunkIndex > 0) {
//       this.currentChunkIndex--;
//       this.updateStatsAndChunk();
//     }
//   }

//   nextChunk() {
//     if (this.currentChunkIndex < this.totalChunks - 1) {
//       this.currentChunkIndex++;
//       this.updateStatsAndChunk();
//     }
//   }

//   downloadResults(): void {
//     if (!this.progress) return;

//     // Collect all records from all chunks
//     const allRecords = (this.progress.chunks || [])
//       .filter((chunk) => chunk !== null && Array.isArray(chunk))
//       .flat() as CleaningResult[];

//     // Create downloadable data with cleaned values
//     const cleanedData = allRecords.map((record) => {
//       const cleanedRecord = { ...record.original };

//       // Apply corrections if they exist
//       if (record.accepted) {
//         Object.keys(record.accepted).forEach((key) => {
//           if (
//             record.accepted![key] !== undefined &&
//             record.accepted![key] !== null
//           ) {
//             cleanedRecord[key] = record.accepted![key];
//           }
//         });
//       }

//       // Add metadata about the cleaning process
//       cleanedRecord['_cleaning_metadata'] = {
//         issues_found: record.issues?.length || 0,
//         corrections_applied: this.hasCorrections(record),
//         suggestions_available: record.suggestions?.length || 0,
//         processed_at: new Date().toISOString(),
//       };

//       return cleanedRecord;
//     });

//     // Create and download file
//     const blob = new Blob([JSON.stringify(cleanedData, null, 2)], {
//       type: 'application/json',
//     });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `cleaned-taxon-data-${
//       new Date().toISOString().split('T')[0]
//     }.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);

//     console.log('Downloaded', cleanedData.length, 'cleaned records');
//   }

//   saveResults(): void {
//     // This could be implemented to save to a database or cloud storage
//     console.log('Save results functionality not yet implemented');
//     // For now, just show a message
//     alert(
//       'Save functionality will be implemented to store results in your preferred location.'
//     );
//   }

//   retryLoad(): void {
//     this.fetchResults();
//   }

//   startNewSession() {
//     this.cleaningService
//       .flushJobs()
//       .pipe(tap(() => console.log('backend confirmed all jobs flushed')))
//       .subscribe({
//         next: () => {
//           // now that flush actually happened, clear any local state:
//           this.jobIds = [];
//           // navigate home
//           this.router.navigate(['/dashboard']);
//         },
//         error: (err) => console.error('Flush failed', err),
//       });
//   }
// }

///////////////////////////////////////////////

// apps/ui/src/app/components/results-review/results-review.component.ts (Updated)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
import { CleaningResult, Issue } from 'apps/ui/src/app/core/models/data.models';
import { tap } from 'rxjs';

@Component({
  selector: 'app-results-review',
  templateUrl: './results-review.component.html',
  styleUrls: ['./results-review.component.scss'],
  standalone: false,
})
export class ResultsReviewComponent implements OnInit {
  totalRecords = 0;
  totalIssues = 0;
  autoCorrected = 0;
  sessionId: string | null = null;
  allResults: CleaningResult[] = [];
  loading = true;

  // Pagination for results view
  currentPage = 0;
  pageSize = 100;
  pagedResults: CleaningResult[] = [];

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;

    this.sessionId = state?.['sessionId'] || null;

    if (!this.sessionId) {
      console.error('No session ID found, redirecting to dashboard');
      this.router.navigate(['/']);
      return;
    }

    this.fetchResults();
  }

  fetchResults() {
    if (!this.sessionId) return;

    this.loading = true;
    this.cleaningService.getAllResults(this.sessionId).subscribe({
      next: (results) => {
        console.log('Fetched all results:', results.length, 'records');
        this.allResults = results;
        this.updateStats();
        this.updatePagedResults();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching results:', error);
        this.loading = false;
      },
    });
  }

  private updateStats() {
    this.totalRecords = this.allResults.length;
    this.totalIssues = this.allResults.reduce(
      (sum, rec) => sum + (rec.issues?.length || 0),
      0
    );
    this.autoCorrected = this.allResults.filter((rec) =>
      this.hasCorrections(rec)
    ).length;
  }

  private updatePagedResults() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedResults = this.allResults.slice(startIndex, endIndex);
  }

  hasCorrections(record: CleaningResult): boolean {
    if (!record.accepted) return false;

    const original = record.original;
    const accepted = record.accepted;

    return (
      original.authorName !== accepted.authorName ||
      original.standardForm !== accepted.standardForm ||
      original.scientificNameAuthorship !== accepted.scientificNameAuthorship
    );
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagedResults();
    }
  }

  nextPage() {
    const maxPage = Math.ceil(this.allResults.length / this.pageSize) - 1;
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePagedResults();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.allResults.length / this.pageSize);
  }

  downloadResults(): void {
    if (!this.allResults.length) return;

    // Create downloadable data with cleaned values
    const cleanedData = this.allResults.map((record) => {
      const cleanedRecord = { ...record.original };

      // Apply corrections if they exist
      if (record.accepted) {
        Object.keys(record.accepted).forEach((key) => {
          if (
            record.accepted![key] !== undefined &&
            record.accepted![key] !== null
          ) {
            cleanedRecord[key] = record.accepted![key];
          }
        });
      }

      // Add metadata about the cleaning process
      cleanedRecord['_cleaning_metadata'] = {
        issues_found: record.issues?.length || 0,
        corrections_applied: this.hasCorrections(record),
        suggestions_available: record.suggestions?.length || 0,
        processed_at: new Date().toISOString(),
      };

      return cleanedRecord;
    });

    // Create and download file
    const blob = new Blob([JSON.stringify(cleanedData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-author-data-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('Downloaded', cleanedData.length, 'cleaned records');
  }

  startNewSession() {
    if (this.sessionId) {
      this.cleaningService
        .cleanupSession(this.sessionId)
        .pipe(tap(() => console.log('Session cleaned up')))
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err) => console.error('Cleanup failed', err),
        });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  retryLoad(): void {
    this.fetchResults();
  }

  // 1) Helper to replace Math.min in template:
  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
  }

  // 2) Helper to join issue messages:
  getIssueMessages(issues: Issue[]): string {
    if (!issues || issues.length === 0) {
      return '';
    }
    return issues.map((i) => i.message).join('; ');
  }
}
