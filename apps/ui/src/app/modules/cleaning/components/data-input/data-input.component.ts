import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DataLoadEvent,
  TaxonRecord,
} from 'apps/ui/src/app/core/models/data.models';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss'],
  standalone: false,
})
export class DataInputComponent {
  @Input() mode: 'taxon' | 'author' = 'author';
  @Output() dataLoaded = new EventEmitter<DataLoadEvent>();

  rawData = '';
  inputErrors: string[] = [];

  lastUploadName: string | null = null;

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.lastUploadName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;

      if (this.mode === 'taxon') {
        // ─── Only in taxon mode do we attempt JSON.parse().
        try {
          JSON.parse(text);
          this.rawData = text;
          this.inputErrors = [];
        } catch {
          this.rawData = '';
          this.inputErrors = ['Invalid JSON file format'];
        }
      } else {
        // ─── In author (CSV) mode, do NOT JSON.parse; just store the CSV text. ──
        this.rawData = text;
        this.inputErrors = [];
      }
    };
    reader.readAsText(file);
  }

  processTextInput() {
    if (!this.rawData?.trim()) return;

    if (this.mode === 'taxon') {
      try {
        const data: TaxonRecord[] = JSON.parse(this.rawData);
        // const data: AuthorRecord[] = JSON.parse(this.rawData);
        if (!Array.isArray(data)) {
          throw new Error('Data must be an array');
        }

        // Emit with correct source when button is clicked
        this.dataLoaded.emit({ data, source: 'text-input' });
        this.inputErrors = [];
      } catch (error) {
        this.inputErrors = [this.getErrorMessage(error)];
      }
    } else {
      if (!this.rawData.trim()) {
        return;
      }

      // Use PapaParse to read the CSV, with header:true so we can reference columns by name.
      const parseResult = Papa.parse<{ [key: string]: string }>(this.rawData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (parseResult.errors.length) {
        // Map PapaParse errors into user‐friendly messages
        this.inputErrors = parseResult.errors.map((e) => {
          // PapaParse `e.type` can be "Delimiter", "Quotes", or "FieldMismatch"
          return `Row ${e.row}: ${e.message}`;
        });
        return;
      }

      const rawRows = parseResult.data as Array<{ [key: string]: string }>;
      if (!rawRows.length) {
        this.inputErrors = ['No data rows found in CSV.'];
        return;
      }

      // Map each row into our AuthorRecord shape.
      // We assume your CSV headers are exactly these five (matching your pterido/IPNI files):
      //   id, author_name, author_forename, author_surname, standard_form
      // If that differs, adjust the keys here accordingly.
      const authors: TaxonRecord[] = rawRows.map((row) => ({
        authorName: (row['author_name'] || '').trim(),
        authorForename: (row['author_forename'] || '').trim() || undefined,
        authorSurname: (row['author_surname'] || '').trim() || undefined,
        standardForm: (row['standard_form'] || '').trim() || undefined,
        scientificName: (row['scientific_name'] || '').trim() || undefined,
      }));

      // Ensure at least one non‐empty authorName
      if (!authors.some((a) => a.authorName)) {
        this.inputErrors = [
          'CSV parsed, but “author_name” was empty on every row.',
        ];
        return;
      }

      // Emit an AuthorLoadEvent
      const payload: DataLoadEvent = {
        data: authors,
        source: 'text-input', // or 'pterido-authors'—you could make this dynamic if you like.
      };
      this.dataLoaded.emit(payload);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof SyntaxError) {
      return 'Invalid JSON syntax - check for missing commas or quotes';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error parsing JSON';
  }
}
