import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CleaningResult,
  TaxonRecord,
} from 'apps/ui/src/app/core/models/data.models';
import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

@Component({
  selector: 'app-chunk-processor',
  templateUrl: 'chunk-processor.component.html',
  styleUrls: ['chunk-processor.component.scss'],
  standalone: false,
})
export class ChunkProcessorComponent {
  @Input() jobId!: string;
  @Input() currentChunkIndex!: number;
  @Input() totalChunks!: number;
  @Input() currentChunk: CleaningResult[] = [];

  @Output() completed = new EventEmitter<CleaningResult[]>();
  @Output() previousChunk = new EventEmitter<void>();
  @Output() nextChunk = new EventEmitter<void>();

  // Make a local copy to avoid modifying the input directly
  get currentRecords(): CleaningResult[] {
    return this.currentChunk.map(
      (record) =>
        ({
          ...record,
          accepted: record.accepted || { ...record.original },
        } as CleaningResult)
    );
  }

  constructor(private cleaningService: CleaningService) {}

  onRecordChange(index: number) {
    // This method is called when user edits a field
    // The two-way binding will automatically update the record
    console.log(`Record ${index} changed`);
  }

  getTotalIssues(): number {
    return this.currentRecords.reduce(
      (total, record) => total + (record.issues?.length || 0),
      0
    );
  }

  getTotalSuggestions(): number {
    return this.currentRecords.reduce(
      (total, record) => total + (record.suggestions?.length || 0),
      0
    );
  }

  getIssueIcon(type: string): string {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  getSuggestionType(suggestion: any): string {
    switch (suggestion.type) {
      case 'taxon':
        return 'Taxon';
      case 'author':
        return 'Author';
      case 'coordinate':
        return 'Coordinate';
      default:
        return 'Unknown';
    }
  }

  getSuggestionValue(suggestion: any): string {
    switch (suggestion.type) {
      case 'taxon':
        return suggestion.acceptedName || suggestion.scientificName;
      case 'author':
        return suggestion.correctedAuthor;
      case 'coordinate':
        return `${suggestion.suggestedLat}, ${suggestion.suggestedLng}`;
      default:
        return 'N/A';
    }
  }

  applySuggestion(recordIndex: number, suggestion: any) {
    const record = this.currentRecords[recordIndex];

    if (!record.accepted) {
      record.accepted = { ...record.original };
    }

    switch (suggestion.type) {
      case 'taxon':
        if (suggestion.acceptedName) {
          record.accepted.scientificName = suggestion.acceptedName;
        } else if (suggestion.scientificName) {
          record.accepted.scientificName = suggestion.scientificName;
        }
        if (suggestion.family) record.accepted.family = suggestion.family;
        if (suggestion.genus) record.accepted.genus = suggestion.genus;
        break;

      case 'author':
        record.accepted.scientificNameAuthorship = suggestion.correctedAuthor;
        break;

      case 'coordinate':
        record.accepted.decimalLatitude = suggestion.suggestedLat;
        record.accepted.decimalLongitude = suggestion.suggestedLng;
        break;
    }

    console.log(`Applied suggestion to record ${recordIndex}:`, suggestion);
  }

  confirmAndContinue() {
    // emit the updated currentChunk
    this.completed.emit(this.currentChunk);
  }
  resetRecord(i: number) {
    this.currentChunk[i].accepted = { ...this.currentChunk[i].original };
  }

  resetChunk() {
    // Reset all accepted values to original values
    this.currentRecords.forEach((record) => {
      record.accepted = { ...record.original };
    });
    console.log('Chunk reset to original values');
  }

  hasValidationErrors(): boolean {
    // Check for basic validation errors
    return this.currentRecords.some((record) => {
      const accepted = record.accepted as TaxonRecord;

      if (!accepted.decimalLatitude || !accepted.decimalLongitude) return false;

      return (
        !accepted.scientificName ||
        accepted.scientificName.trim().length === 0 ||
        accepted.decimalLatitude < -90 ||
        accepted.decimalLatitude > 90 ||
        accepted.decimalLongitude < -180 ||
        accepted.decimalLongitude > 180
      );
    });
  }
}
