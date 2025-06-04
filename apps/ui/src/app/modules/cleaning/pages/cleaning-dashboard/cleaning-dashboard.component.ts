import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, forkJoin } from 'rxjs';

import {
  CleaningResult,
  CleaningSettings,
  DataLoadEvent,
} from 'apps/ui/src/app/core/models/data.models';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cleaning-dashboard',
  templateUrl: './cleaning-dashboard.component.html',
  styleUrls: ['./cleaning-dashboard.component.scss'],
  standalone: false,
})
export class CleaningDashboardComponent {
  private destroy$ = new Subject<void>();
  cleanMode: 'taxon' | 'author' = 'author';

  // Job management
  jobIds: string[] = [];
  currentJobId: string = '';

  // Chunk management
  currentChunkIndex = 0;
  totalChunks = 0;
  processedChunks = 0;
  currentRecords: CleaningResult[] = [];

  // State tracking
  allChunksCompleted = false;
  navigatingToResults = false;
  availableChunks: Set<number> = new Set();
  processedChunkIndices: Set<number> = new Set();

  // Loading states
  isLoadingChunk = false;

  // Settings
  settings: CleaningSettings = {
    autoCorrectAuthors: true,
    validateCoordinates: true,
    resolveTaxonomy: true,
    chunkSize: 50,
    confidenceThreshold: 0.8,
    currentSource: 'symbiota2',
    inputMethod: ['file-upload', 'text-input'],
  };

  private currentJobSubscriptions: Subscription[] = [];

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  onSettings(newSettings: CleaningSettings) {
    this.settings = { ...newSettings };
  }

  startCleaning(event: DataLoadEvent) {
    console.log('Starting cleaning session with', event.data.length, 'records');

    // Reset all state
    this.resetState();

    this.cleaningService
      .startCleaningSession(event.data, this.settings)
      .subscribe({
        next: ({ jobIds, totalChunks }) => {
          console.log('Jobs created:', { jobIds, totalChunks });
          this.jobIds = jobIds;
          this.totalChunks = totalChunks;
          this.currentJobId = jobIds[0]; // Use first job ID as primary
          this.waitForAllJobsCompletion();
        },
        error: (error) => {
          console.error('Error starting cleaning session:', error);
          this.isLoadingChunk = false;
        },
      });
  }

  private resetState() {
    this.allChunksCompleted = false;
    this.navigatingToResults = false;
    this.availableChunks.clear();
    this.processedChunkIndices.clear();
    this.currentRecords = [];
    this.isLoadingChunk = false;
    this.currentChunkIndex = 0;
    this.processedChunks = 0;
    this.jobIds = [];
    this.currentJobId = '';

    // Clean up existing subscriptions
    this.currentJobSubscriptions.forEach((sub) => sub.unsubscribe());
    this.currentJobSubscriptions = [];
  }

  private waitForAllJobsCompletion() {
    if (!this.jobIds.length) return;

    console.log('Waiting for all jobs to complete:', this.jobIds);

    // Create progress observables for all jobs
    const progressObservables = this.jobIds.map((jobId) =>
      this.cleaningService.getJobProgress(jobId)
    );

    // Poll every 2 seconds until all jobs are complete
    const pollSubscription = setInterval(() => {
      forkJoin(progressObservables).subscribe({
        next: (progressArray) => {
          const allCompleted = progressArray.every(
            (p) => p.currentChunk === p.totalChunks
          );

          if (allCompleted) {
            clearInterval(pollSubscription);
            console.log('All jobs completed, marking chunks as available');

            // Mark all chunks as available
            for (let i = 0; i < this.totalChunks; i++) {
              this.availableChunks.add(i);
            }

            // Load the first chunk
            this.loadSpecificChunk(0);
          }
        },
        error: (error) => {
          console.error('Error polling job progress:', error);
          clearInterval(pollSubscription);
        },
      });
    }, 2000);

    // Store subscription for cleanup
    this.currentJobSubscriptions.push({
      unsubscribe: () => clearInterval(pollSubscription),
    } as Subscription);
  }

  private loadSpecificChunk(chunkIndex: number) {
    if (this.isLoadingChunk || chunkIndex >= this.jobIds.length) {
      console.log('Already loading a chunk or invalid chunk index, skipping');
      return;
    }

    this.isLoadingChunk = true;
    const jobId = this.jobIds[chunkIndex];

    console.log(`Loading chunk ${chunkIndex} from job ${jobId}`);

    this.cleaningService.getChunk(jobId, chunkIndex).subscribe({
      next: (chunk) => {
        console.log(`Loaded chunk ${chunkIndex}:`, chunk.length, 'records');
        this.currentRecords = chunk;
        this.currentChunkIndex = chunkIndex;
        this.currentJobId = jobId;
        this.isLoadingChunk = false;
      },
      error: (error) => {
        console.error(`Error loading chunk ${chunkIndex}:`, error);
        this.isLoadingChunk = false;
      },
    });
  }

  onChunkComplete(corrections: CleaningResult[]) {
    const chunkIndex = this.currentChunkIndex;
    const jobId = this.jobIds[chunkIndex];

    console.log(`Saving corrections for chunk ${chunkIndex} (job ${jobId})`);

    this.cleaningService
      .approveChunk(jobId, chunkIndex, corrections)
      .subscribe({
        next: () => {
          console.log(`Chunk ${chunkIndex} corrections saved successfully`);

          // Mark this chunk as processed
          this.processedChunkIndices.add(chunkIndex);
          this.processedChunks = this.processedChunkIndices.size;

          // Check if all chunks are processed
          if (this.processedChunks >= this.totalChunks) {
            this.completeAllChunks();
          } else {
            // Move to next available chunk
            this.moveToNextChunk();
          }
        },
        error: (error) => {
          console.error(`Error saving chunk ${chunkIndex}:`, error);
        },
      });
  }

  private moveToNextChunk() {
    // Find next unprocessed but available chunk
    const unprocessedAvailable = Array.from(this.availableChunks)
      .filter((index) => !this.processedChunkIndices.has(index))
      .sort((a, b) => a - b);

    console.log('Unprocessed available chunks:', unprocessedAvailable);

    if (unprocessedAvailable.length > 0) {
      const nextChunk = unprocessedAvailable[0];
      this.loadSpecificChunk(nextChunk);
    } else {
      console.log('No more chunks to process');
      this.currentRecords = [];
      this.completeAllChunks();
    }
  }

  private completeAllChunks() {
    console.log('All chunks completed, preparing to navigate to results');
    this.allChunksCompleted = true;
    this.currentRecords = [];

    // Short delay before navigation to show completion message
    setTimeout(() => {
      this.navigateToResults();
    }, 1500);
  }

  onPreviousChunk() {
    if (this.isLoadingChunk) return;

    const availableIndices = Array.from(this.availableChunks).sort(
      (a, b) => a - b
    );
    const currentPos = availableIndices.indexOf(this.currentChunkIndex);

    if (currentPos > 0) {
      this.loadSpecificChunk(availableIndices[currentPos - 1]);
    }
  }

  onNextChunk() {
    if (this.isLoadingChunk) return;

    const availableIndices = Array.from(this.availableChunks).sort(
      (a, b) => a - b
    );
    const currentPos = availableIndices.indexOf(this.currentChunkIndex);

    if (currentPos < availableIndices.length - 1) {
      this.loadSpecificChunk(availableIndices[currentPos + 1]);
    }
  }

  private navigateToResults() {
    console.log('Navigating to results with job data:', {
      jobIds: this.jobIds,
      primaryJobId: this.currentJobId,
      totalChunks: this.totalChunks,
    });

    this.navigatingToResults = true;
    this.destroy$.next();

    this.router.navigate(['/results'], {
      state: {
        jobIds: this.jobIds,
        primaryJobId: this.currentJobId,
        totalChunks: this.totalChunks,
      },
    });
  }

  startNewSession() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up job subscriptions
    this.currentJobSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
