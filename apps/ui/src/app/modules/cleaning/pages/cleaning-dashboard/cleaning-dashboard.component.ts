import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import {
  CleaningResult,
  CleaningSettings,
  CleanMode,
  DataLoadEvent,
  SessionProgress,
} from 'apps/ui/src/app/core/models/data.models';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

@Component({
  selector: 'app-cleaning-dashboard',
  templateUrl: './cleaning-dashboard.component.html',
  styleUrls: ['./cleaning-dashboard.component.scss'],
  standalone: false,
})
export class CleaningDashboardComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  cleanMode: CleanMode = 'author';

  // Session management
  sessionId: string | null = null;
  sessionProgress: SessionProgress | null = null;

  // Chunk management
  currentChunkIndex = 0;
  totalChunks = 0;
  currentRecords: CleaningResult[] = [];

  // State tracking
  allChunksCompleted = false;
  isInitializing = false;
  isLoadingChunk = false;

  // Settings
  settings: CleaningSettings = {
    autoCorrectAuthors: true,
    validateCoordinates: false, // Disabled by default for author tool
    resolveTaxonomy: false, // Disabled by default for author tool
    chunkSize: 100,
    confidenceThreshold: 0.8,
    currentSource: 'ipni', // Default to IPNI for authors
    inputMethod: ['file-upload', 'text-input'],
  };

  private progressSubscription: Subscription | null = null;

  constructor(
    private cleaningService: CleaningService,
    private router: Router
  ) {}

  onSettings(newSettings: CleaningSettings) {
    this.settings = { ...newSettings };
  }

  startCleaning(event: DataLoadEvent) {
    console.log('Starting cleaning session with', event.data.length, 'records');

    this.resetState();
    this.isInitializing = true;

    this.cleaningService
      .startCleaningSession(event.data, this.settings)
      .subscribe({
        next: ({ sessionId, totalChunks }) => {
          console.log('Session created:', { sessionId, totalChunks });
          this.sessionId = sessionId;
          this.totalChunks = totalChunks;
          this.startProgressPolling();
        },
        error: (error) => {
          console.error('Error starting cleaning session:', error);
          this.isInitializing = false;
        },
      });
  }

  private resetState() {
    this.sessionId = null;
    this.sessionProgress = null;
    this.allChunksCompleted = false;
    this.isInitializing = false;
    this.currentRecords = [];
    this.isLoadingChunk = false;
    this.currentChunkIndex = 0;
    this.totalChunks = 0;

    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
      this.progressSubscription = null;
    }
  }

  private startProgressPolling() {
    if (!this.sessionId) return;

    this.progressSubscription = interval(2000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() =>
          this.cleaningService.getSessionProgress(this.sessionId!)
        )
      )
      .subscribe({
        next: (progress) => {
          this.sessionProgress = progress;

          if (this.isInitializing && progress.readyChunks.length > 0) {
            this.isInitializing = false;
            this.loadChunk(0); // Load first available chunk
          }
        },
        error: (error) => {
          console.error('Error polling progress:', error);
          this.isInitializing = false;
        },
      });
  }

  private loadChunk(chunkIndex: number) {
    if (!this.sessionId || this.isLoadingChunk) return;

    if (!this.sessionProgress?.readyChunks.includes(chunkIndex)) {
      console.log(`Chunk ${chunkIndex} not ready yet`);
      return;
    }

    this.isLoadingChunk = true;
    this.currentChunkIndex = chunkIndex;

    this.cleaningService.getChunk(this.sessionId, chunkIndex).subscribe({
      next: (chunk) => {
        console.log(`Loaded chunk ${chunkIndex}:`, chunk.length, 'records');

        // Filter out records with no issues AND no suggestions:
        const filtered = chunk.filter((rec) => {
          const hasIssues = (rec.issues?.length || 0) > 0;
          const hasSuggestions = (rec.suggestions?.length || 0) > 0;
          return hasIssues || hasSuggestions;
        });

        if (filtered.length === 0) {
          console.log(
            `Chunk ${chunkIndex} has no problematic records; skipping automatically.`
          );
          this.isLoadingChunk = false;
          // Automatically mark this chunk as complete with empty corrections:
          this.onChunkComplete([]);
        } else {
          // Only display problematic records
          this.currentRecords = filtered;
          this.isLoadingChunk = false;
        }
      },
      error: (error) => {
        console.error(`Error loading chunk ${chunkIndex}:`, error);
        this.isLoadingChunk = false;
      },
    });
  }

  onChunkComplete(corrections: CleaningResult[]) {
    if (!this.sessionId) return;

    console.log(`Saving corrections for chunk ${this.currentChunkIndex}`);

    this.cleaningService
      .approveChunk(this.sessionId, this.currentChunkIndex, corrections)
      .subscribe({
        next: () => {
          console.log(`Chunk ${this.currentChunkIndex} corrections saved`);

          // Check if all chunks are completed
          const correctedCount =
            (this.sessionProgress?.correctedChunks.length || 0) + 1;
          if (correctedCount >= this.totalChunks) {
            this.completeAllChunks();
          } else {
            // Move to next available chunk
            this.moveToNextChunk();
          }
        },
        error: (error) => {
          console.error(`Error saving chunk ${this.currentChunkIndex}:`, error);
        },
      });
  }

  private moveToNextChunk() {
    if (!this.sessionProgress) return;

    const nextChunkIndex = this.currentChunkIndex + 1;

    if (nextChunkIndex < this.totalChunks) {
      // Check if next chunk is ready
      if (this.sessionProgress.readyChunks.includes(nextChunkIndex)) {
        this.loadChunk(nextChunkIndex);
      } else {
        // Wait for next chunk to be ready
        this.currentRecords = [];
        console.log(`Waiting for chunk ${nextChunkIndex} to be ready`);
      }
    } else {
      this.completeAllChunks();
    }
  }

  private completeAllChunks() {
    console.log('All chunks completed, preparing to navigate to results');
    this.allChunksCompleted = true;
    this.currentRecords = [];

    setTimeout(() => {
      this.navigateToResults();
    }, 1500);
  }

  onPreviousChunk() {
    if (this.isLoadingChunk || this.currentChunkIndex === 0) return;
    this.loadChunk(this.currentChunkIndex - 1);
  }

  onNextChunk() {
    if (this.isLoadingChunk || !this.sessionProgress) return;

    const nextIndex = this.currentChunkIndex + 1;
    if (
      nextIndex < this.totalChunks &&
      this.sessionProgress.readyChunks.includes(nextIndex)
    ) {
      this.loadChunk(nextIndex);
    }
  }

  private navigateToResults() {
    if (!this.sessionId) return;

    console.log('Navigating to results with session:', this.sessionId);

    this.router.navigate(['/results'], {
      state: {
        sessionId: this.sessionId,
        totalChunks: this.totalChunks,
      },
    });
  }

  startNewSession() {
    this.resetState();
    this.router.navigate(['/dashboard']);
  }

  // Helper method to check if next chunk button should be disabled
  isNextChunkDisabled(): boolean {
    if (!this.sessionProgress || this.isLoadingChunk) return true;

    const nextIndex = this.currentChunkIndex + 1;
    return (
      nextIndex >= this.totalChunks ||
      !this.sessionProgress.readyChunks.includes(nextIndex)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }
}
