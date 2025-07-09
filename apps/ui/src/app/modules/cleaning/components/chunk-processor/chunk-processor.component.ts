import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CleaningResult,
  TaxonRecord,
} from 'apps/ui/src/app/core/models/data.models';

@Component({
  selector: 'app-chunk-processor',
  templateUrl: 'chunk-processor.component.html',
  styleUrls: ['chunk-processor.component.scss'],
  standalone: false,
})
export class ChunkProcessorComponent {
  @Input() jobId!: string; // Now sessionId
  @Input() currentChunkIndex!: number;
  @Input() totalChunks!: number;
  @Input() currentChunk: CleaningResult[] = [];

  @Output() completed = new EventEmitter<CleaningResult[]>();
  @Output() previousChunk = new EventEmitter<void>();
  @Output() nextChunk = new EventEmitter<void>();

  // get currentRecords(): CleaningResult[] {
  //   return this.currentChunk.map(
  //     (record) =>
  //       ({
  //         ...record,
  //         accepted: record.accepted || { ...record.original },
  //       } as CleaningResult)
  //   );
  // }

  get currentRecords(): CleaningResult[] {
    return this.currentChunk.map((record) => {
      console.log('cleaned: >>>>>>>>>>>>>>>>>>>>>>>>>>>>>', record.cleaned);
      if (!record.accepted) {
        record.accepted = {
          ...record.original,
          // Seed the input field from the cleaned authorName first:
          authorName: record.cleaned || record.original.authorName,
        } as any;
      }
      return record;
    });
  }

  onRecordChange(index: number) {
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
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }

  getSuggestionType(suggestion: any): string {
    switch (suggestion.type) {
      case 'author':
        return 'Author';
      case 'coordinate':
        return 'Coordinate';
      case 'taxon':
        return 'Taxon';
      default:
        return 'Unknown';
    }
  }

  getSuggestionValue(suggestion: any): string {
    switch (suggestion.type) {
      case 'author':
        return `${suggestion.correctedAuthor} (${
          suggestion.source || 'unknown'
        })`;
      case 'coordinate':
        return `${suggestion.suggestedLat}, ${suggestion.suggestedLng}`;
      case 'taxon':
        return suggestion.acceptedName || suggestion.scientificName;
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
      case 'author':
        // For author tool, apply to the main author field
        record.accepted.authorName = suggestion.correctedAuthor;
        if (suggestion.source) {
          record.accepted.source = suggestion.source;
        }
        break;

      case 'coordinate':
        record.accepted.decimalLatitude = suggestion.suggestedLat;
        record.accepted.decimalLongitude = suggestion.suggestedLng;
        break;

      case 'taxon':
        if (suggestion.acceptedName) {
          record.accepted.scientificName = suggestion.acceptedName;
        }
        if (suggestion.family) record.accepted.family = suggestion.family;
        if (suggestion.genus) record.accepted.genus = suggestion.genus;
        break;
    }

    console.log(`Applied suggestion to record ${recordIndex}:`, suggestion);
  }

  confirmAndContinue() {
    this.completed.emit(this.currentChunk);
  }

  resetRecord(i: number) {
    this.currentChunk[i].accepted = { ...this.currentChunk[i].original };
  }

  resetChunk() {
    this.currentRecords.forEach((record) => {
      record.accepted = { ...record.original };
    });
    console.log('Chunk reset to original values');
  }

  hasValidationErrors(): boolean {
    return this.currentRecords.some((record) => {
      const accepted = record.accepted as TaxonRecord;

      // For author tool, main validation is having a non-empty author name
      return !accepted.authorName || accepted.authorName.trim().length === 0;
    });
  }

  // Helper method to get author-specific display info
  getAuthorDisplayValue(
    record: CleaningResult,
    field: 'original' | 'accepted'
  ): string {
    const data = field === 'original' ? record.original : record.accepted;

    if (data.authorName) {
      let display = data.authorName;
      if (data.standardForm && data.standardForm !== data.authorName) {
        display += ` → ${data.standardForm}`;
      }
      return display;
    }

    return 'N/A';
  }

  // Check if record has author-related issues
  hasAuthorIssues(record: CleaningResult): boolean {
    return record.issues.some(
      (issue) =>
        issue.field === 'authorName' ||
        issue.message.toLowerCase().includes('author')
    );
  }

  // Get author-specific suggestions
  getAuthorSuggestions(record: CleaningResult) {
    return record.suggestions.filter((s) => s.type === 'author');
  }
}
