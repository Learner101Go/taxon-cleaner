import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
import { CleaningResult } from 'apps/ui/src/app/core/models/data.models';
import { tap } from 'rxjs';

@Component({
  selector: 'app-results-review',
  templateUrl: './results-review.component.html',
  styleUrls: ['./results-review.component.scss'],
  standalone: false,
})
export class ResultsReviewComponent implements OnInit {
  sessionId: string | null = null;
  allResults: CleaningResult[] = [];
  loading = true;

  // Pagination
  currentPage = 0;
  pageSize = 50;

  // Stats
  totalRecords = 0;
  totalIssues = 0;
  autoCorrected = 0;

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;

    this.sessionId = state?.['sessionId'] || null;

    console.log('Results component initialized with session:', this.sessionId);

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
        console.log('Fetched results:', results.length, 'records');
        this.allResults = results;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching results:', error);
        this.loading = false;
      },
    });
  }

  private calculateStats() {
    this.totalRecords = this.allResults.length;
    this.totalIssues = this.allResults.reduce(
      (sum, rec) => sum + (rec.issues?.length || 0),
      0
    );
    this.autoCorrected = this.allResults.filter((rec) =>
      this.hasCorrections(rec)
    ).length;
  }

  hasCorrections(record: CleaningResult): boolean {
    if (!record.accepted) return false;

    const original = record.original;
    const accepted = record.accepted;

    // Check author-specific fields
    return (
      original.authorName !== accepted.authorName ||
      original.standardForm !== accepted.standardForm ||
      original.scientificName !== accepted.scientificName ||
      original.scientificNameAuthorship !== accepted.scientificNameAuthorship ||
      original.decimalLatitude !== accepted.decimalLatitude ||
      original.decimalLongitude !== accepted.decimalLongitude ||
      original.family !== accepted.family
    );
  }

  get pagedResults(): CleaningResult[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.allResults.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getIssueMessages(issues: any[]): string {
    return issues?.map((issue) => issue.message).join(', ') || '';
  }

  // downloadResults(): void {
  //   if (!this.allResults.length) return;

  //   // Create downloadable data with cleaned values
  //   const cleanedData = this.allResults.map((record) => {
  //     const cleanedRecord = { ...record.original };

  //     // Apply corrections if they exist
  //     if (record.accepted) {
  //       Object.keys(record.accepted).forEach((key) => {
  //         if (
  //           record.accepted![key] !== undefined &&
  //           record.accepted![key] !== null &&
  //           record.accepted![key] !== ''
  //         ) {
  //           cleanedRecord[key] = record.accepted![key];
  //         }
  //       });
  //     }

  //     // Add metadata about the cleaning process
  //     cleanedRecord['_cleaning_metadata'] = {
  //       issues_found: record.issues?.length || 0,
  //       corrections_applied: this.hasCorrections(record),
  //       suggestions_available: record.suggestions?.length || 0,
  //       processed_at: new Date().toISOString(),
  //     };

  //     return cleanedRecord;
  //   });

  //   // Determine file format based on data type
  //   const isAuthorData = this.allResults.some((r) => r.original.authorName);
  //   const fileName = `cleaned-${isAuthorData ? 'authors' : 'taxon'}-data-${
  //     new Date().toISOString().split('T')[0]
  //   }`;

  //   if (isAuthorData) {
  //     // Export as CSV for author data
  //     this.downloadAsCSV(cleanedData, fileName);
  //   } else {
  //     // Export as JSON for taxon data
  //     this.downloadAsJSON(cleanedData, fileName);
  //   }

  //   console.log('Downloaded', cleanedData.length, 'cleaned records');
  // }

  // private downloadAsCSV(data: any[], fileName: string) {
  //   const csvHeaders = [
  //     'id',
  //     'author_name',
  //     'author_forename',
  //     'author_surname',
  //     'standard_form',
  //     'scientific_name',
  //   ];
  //   const csvRows = [
  //     csvHeaders.join(','),
  //     ...data.map((record) =>
  //       csvHeaders
  //         .map((header) => {
  //           const value = record[header] || '';
  //           // Escape commas and quotes in CSV
  //           return `"${String(value).replace(/"/g, '""')}"`;
  //         })
  //         .join(',')
  //     ),
  //   ];

  //   const csvContent = csvRows.join('\n');
  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   this.downloadBlob(blob, `${fileName}.csv`);
  // }

  // private downloadAsJSON(data: any[], fileName: string) {
  //   const blob = new Blob([JSON.stringify(data, null, 2)], {
  //     type: 'application/json',
  //   });
  //   this.downloadBlob(blob, `${fileName}.json`);
  // }

  downloadResults(): void {
    if (!this.allResults.length) {
      return;
    }

    // 1) Build an array of “export records”
    const exportRecords: Record<string, any>[] = this.allResults.map((r) => {
      // Start with a shallow copy of the original record
      const flat = { ...r.original } as any;

      // Override or inject a single flat author_name column:
      // either from the accepted override or from original
      flat.author_name = r.accepted?.authorName ?? flat.authorName ?? '';

      // If you want to remove the old camelCase field, uncomment:
      // delete flat.authorName;

      // (Optional) you can inject more metadata if you like:
      flat._issues_found = r.issues?.length ?? 0;
      flat._corrections_applied = this.hasCorrections(r);
      flat._suggestions_available = r.suggestions?.length ?? 0;
      flat._processed_at = new Date().toISOString();

      return flat;
    });

    // 2) Grab headers from the first record (will include all original columns + our injected ones)
    const headers = Object.keys(exportRecords[0]);

    // 3) Decide format (CSV if any author_name present, else JSON)
    const isAuthorData = exportRecords.some(
      (rec) => rec['author_name'] !== undefined && rec['author_name'] !== ''
    );
    const baseName = isAuthorData ? 'authors' : 'taxon';
    const fileName = `cleaned-${baseName}-data-${
      new Date().toISOString().split('T')[0]
    }`;

    if (isAuthorData) {
      this.downloadAsCSV(exportRecords, headers, `${fileName}.csv`);
    } else {
      this.downloadAsJSON(exportRecords, `${fileName}.json`);
    }
  }

  private downloadAsCSV(
    data: Record<string, any>[],
    headers: string[],
    fileName: string
  ) {
    // 1) Header row
    const headerRow = headers
      .map((h) => `"${h.replace(/"/g, '""')}"`)
      .join(',');

    // 2) Data rows
    const dataRows = data.map((rec) =>
      headers
        .map((h) => {
          const cell = rec[h] ?? '';
          // escape quotes
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, fileName);
  }

  private downloadAsJSON(data: Record<string, any>[], fileName: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], {
      type: 'application/json;charset=utf-8;',
    });
    this.downloadBlob(blob, fileName);
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('style', 'display: none;');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // private downloadBlob(blob: Blob, fileName: string) {
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = fileName;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // }

  retryLoad(): void {
    this.fetchResults();
  }

  startNewSession() {
    this.cleaningService
      .flushSessions()
      .pipe(tap(() => console.log('Backend confirmed all sessions flushed')))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => console.error('Flush failed', err),
      });
  }
}
