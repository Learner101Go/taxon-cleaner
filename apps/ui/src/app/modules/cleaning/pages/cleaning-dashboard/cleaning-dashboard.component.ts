// apps/ui/src/app/modules/cleaning/pages/cleaning-dashboard/cleaning-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CleaningResult,
  CleaningSettings,
  DataLoadEvent,
} from 'apps/ui/src/app/core/models/data.models';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

@Component({
  selector: 'app-cleaning-dashboard',
  template: `
    <div class="dashboard-container">
      <app-settings-panel
        (settingsChanged)="onSettings($event)"
      ></app-settings-panel>
      <app-data-input (dataLoaded)="startCleaning($event)"></app-data-input>

      <ng-container *ngIf="currentJobId">
        <app-chunk-processor
          [jobId]="currentJobId"
          [currentChunkIndex]="currentChunkIndex"
          [totalChunks]="totalChunks"
          [currentChunk]="currentRecords"
          (completed)="onChunkComplete($event)"
          (previousChunk)="onPreviousChunk()"
          (nextChunk)="onNextChunk()"
        ></app-chunk-processor>
      </ng-container>

      <div class="global-progress">
        <mat-progress-bar
          mode="determinate"
          [value]="((currentChunkIndex + 1) / totalChunks) * 100"
        >
        </mat-progress-bar>
        <span class="progress-text">
          Processed {{ currentChunkIndex + 1 }} of {{ totalChunks }} chunks
        </span>
      </div>
    </div>
  `,
  standalone: false,
})
export class CleaningDashboardComponent {
  currentChunkIndex = 0;
  totalChunks = 0;
  currentJobId!: string;
  currentRecords: CleaningResult[] = [];

  settings: CleaningSettings = {
    autoCorrectAuthors: true,
    validateCoordinates: true,
    resolveTaxonomy: true,
    chunkSize: 50,
    confidenceThreshold: 0.8,
    currentSource: 'symbiota2',
    inputMethod: ['file-upload', 'text-input'],
  };

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  onSettings(settings: CleaningSettings) {
    this.settings = { ...this.settings, ...settings };
    console.log('Updated cleaning settings:', this.settings);
  }
  // Add navigation handlers
  onPreviousChunk() {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.loadChunk();
    }
  }

  onNextChunk() {
    if (this.currentChunkIndex < this.totalChunks - 1) {
      this.currentChunkIndex++;
      this.loadChunk();
    }
  }

  startCleaning(event: DataLoadEvent) {
    this.cleaningService
      .startCleaningSession(event.data, this.settings)
      .subscribe(({ jobId, totalChunks }) => {
        console.log('Job created:', jobId, 'Total chunks:', totalChunks);
        this.currentJobId = jobId;
        this.totalChunks = totalChunks;
        this.loadChunk();
      });
  }

  loadChunk() {
    this.cleaningService.getChunk(this.currentChunkIndex).subscribe((chunk) => {
      console.log('Loaded chunk', this.currentChunkIndex, chunk);
      this.currentRecords = chunk.map((record) => ({
        ...record,
        accepted: record.accepted || { ...record.original },
      }));
    });
  }

  onChunkComplete(corrections: CleaningResult[]) {
    this.cleaningService
      .approveChunk(this.currentChunkIndex, corrections)
      .subscribe(() => {
        if (this.currentChunkIndex < this.totalChunks - 1) {
          this.currentChunkIndex++;
          this.loadChunk();
        } else {
          console.log('Redirecting to /results with jobId:', this.currentJobId);
          this.router.navigate(['/results'], {
            state: { jobId: this.currentJobId },
          });
        }
      });
  }
}
