import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AuthorSuggestion,
  CleaningChunk,
  CleaningResult,
  CoordSuggestion,
  isTaxonSuggestion,
  TaxonRecord,
  TaxonSuggestion,
} from 'apps/ui/src/app/core/models/data.models';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

@Component({
  selector: 'app-chunk-processor',
  template: `
    <div class="chunk-container">
      <div class="navigation-header">
        <button
          mat-button
          (click)="previousChunk.emit()"
          [disabled]="currentChunkIndex === 0"
        >
          <mat-icon>chevron_left</mat-icon> Previous
        </button>
        <span class="chunk-counter"
          >Chunk {{ currentChunkIndex + 1 }} of {{ totalChunks }}</span
        >
        <button
          mat-button
          (click)="nextChunk.emit()"
          [disabled]="currentChunkIndex === totalChunks - 1"
        >
          Next <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div *ngIf="currentChunk" class="records-container">
        <div class="record-card" *ngFor="let record of currentChunk">
          <h3>{{ record.original.scientificName }}</h3>

          <div class="issues-section">
            <div *ngFor="let issue of record.issues" class="issue-badge">
              {{ issue.message }}
            </div>
          </div>
          <!--
          <div class="suggestions-box">
            <button
              mat-raised-button
              *ngFor="let suggestion of record.suggestions"
              (click)="applySuggestion(record, suggestion)"
            >
              {{ suggestion.value | truncate : 25 }}
            </button>
          </div>

          <div class="correction-editor">
            <mat-form-field>
              <textarea
                matInput
                [(ngModel)]="record.accepted.scientificName"
                placeholder="Scientific Name"
              ></textarea>
            </mat-form-field>
            <mat-form-field>
              <input
                type="number"
                matInput
                [(ngModel)]="record.accepted.decimalLatitude"
                placeholder="Latitude"
              />
            </mat-form-field>
            <mat-form-field>
              <input
                type="number"
                matInput
                [(ngModel)]="record.accepted.decimalLongitude"
                placeholder="Longitude"
              />
            </mat-form-field>
          </div> -->

          <div class="suggestions-box">
            <button
              mat-raised-button
              *ngFor="let suggestion of record.suggestions"
              (click)="applySuggestion(record, suggestion)"
            >
              {{ suggestion.value }}
            </button>
          </div>

          <div class="correction-editor">
            <mat-form-field>
              <textarea
                matInput
                [(ngModel)]="record.accepted.scientificName"
                placeholder="Accepted Scientific Name"
              ></textarea>
            </mat-form-field>
          </div>

          <button
            mat-raised-button
            *ngFor="let suggestion of record.suggestions"
            (click)="applySuggestion(record, suggestion)"
          >
            {{ getSuggestionDisplay(suggestion) }}
          </button>
        </div>

        <div class="action-footer">
          <button mat-raised-button color="primary" (click)="saveAndContinue()">
            Confirm and Continue
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: false,
})
export class ChunkProcessorComponent {
  @Input() currentChunkIndex!: number;
  @Input() totalChunks!: number;
  @Input() currentChunk!: CleaningResult[];
  @Output() completed = new EventEmitter<CleaningResult[]>();
  @Output() previousChunk = new EventEmitter<void>();
  @Output() nextChunk = new EventEmitter<void>();

  constructor(private cleaning: CleaningService) {}

  ngOnInit() {
    this.loadChunk();
  }

  loadChunk() {
    this.cleaning.getChunk(this.currentChunkIndex).subscribe((chunk) => {
      this.currentChunk = chunk.map((record) => ({
        ...record,
        accepted: {
          scientificName: record.original.scientificName,
          acceptedNameUsageID: '',
          taxonomicStatus: 'unprocessed',
          ...record.accepted,
        },
      }));
    });
  }

  saveAndContinue() {
    const corrections = this.currentChunk.map((record) => ({
      ...record,
      accepted: this.getAcceptedCorrections(record),
    }));
    this.completed.emit(corrections);
  }

  applySuggestion(
    record: CleaningResult,
    suggestion: AuthorSuggestion | CoordSuggestion | TaxonSuggestion
  ) {
    // Type-safe suggestion handling
    if (suggestion.type === 'author-normalization') {
      record.accepted = {
        ...record.accepted,
        scientificNameAuthorship: suggestion.value,
      };
    } else if (suggestion.type === 'coordinate-correction') {
      record.accepted = {
        ...record.accepted,
        decimalLatitude: suggestion.value.decimalLatitude,
        decimalLongitude: suggestion.value.decimalLongitude,
      };
    } else if (suggestion.type === 'taxon-resolution') {
      record.accepted = {
        ...record.accepted,
        scientificName: suggestion.value.scientificName,
        taxonRank: suggestion.value.taxonRank,
      };
    }
  }

  private getAcceptedCorrections(
    record: CleaningResult
  ): CleaningResult['accepted'] {
    // Initialize with original values as fallback
    const baseAccepted = {
      scientificName: record.original.scientificName,
      acceptedNameUsageID: '',
      taxonomicStatus: 'unprocessed' as const,
    };

    // Merge with any existing corrections
    const merged = {
      ...baseAccepted,
      ...record.accepted,
    };

    // Apply taxonomy suggestions
    record.suggestions.forEach((suggestion) => {
      if (isTaxonSuggestion(suggestion)) {
        merged.scientificName =
          suggestion.value.scientificName || merged.scientificName;
        merged.acceptedNameUsageID = suggestion.value.acceptedNameUsageID || '';
        merged.taxonomicStatus = 'unprocessed';
      }
    });

    // Apply user edits from the UI
    if (record.accepted?.scientificName) {
      merged.scientificName = record.accepted.scientificName;
      merged.taxonomicStatus = 'unprocessed';
    }

    return merged;
  }

  getSuggestionDisplay(
    suggestion: AuthorSuggestion | CoordSuggestion | TaxonSuggestion
  ): string {
    if (isTaxonSuggestion(suggestion)) {
      return suggestion.value.scientificName || '';
    } else if (suggestion.type === 'coordinate-correction') {
      return `${suggestion.value.decimalLatitude}, ${suggestion.value.decimalLongitude}`;
    } else {
      return suggestion.value.toString();
    }
  }
}
