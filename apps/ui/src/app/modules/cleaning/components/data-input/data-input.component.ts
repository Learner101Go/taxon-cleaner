// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import {
//   CleanMode,
//   DataLoadEvent,
//   TaxonRecord,
// } from 'apps/ui/src/app/core/models/data.models';
// import * as Papa from 'papaparse';

// @Component({
//   selector: 'app-data-input',
//   templateUrl: './data-input.component.html',
//   styleUrls: ['./data-input.component.scss'],
//   standalone: false,
// })
// export class DataInputComponent {
//   @Input() mode!: CleanMode;
//   @Output() dataLoaded = new EventEmitter<DataLoadEvent>();

//   rawData = '';
//   inputErrors: string[] = [];
//   duplicateAuthorCount: number = 0; // holds number of duplicates detected
//   lastUploadName: string | null = null;

//   handleFileUpload(event: Event) {
//     const input = event.target as HTMLInputElement;
//     const file = input.files?.[0];
//     if (!file) return;

//     this.lastUploadName = file.name;
//     const reader = new FileReader();
//     reader.onload = () => {
//       const text = reader.result as string;
//       this.rawData = text;
//       this.inputErrors = [];
//       this.duplicateAuthorCount = 0; // reset on each upload

//       if (this.mode === 'taxon') {
//         // ─── Only in taxon mode do we attempt JSON.parse().
//         try {
//           JSON.parse(text);
//         } catch {
//           this.rawData = '';
//           this.inputErrors = ['Invalid JSON file format'];
//         }
//       } else {
//         // ─── In author (CSV) mode, do NOT JSON.parse; but parse now to count duplicates
//         // We parse header:true so we can reference columns by name.
//         const parseResult = Papa.parse<{ [key: string]: string }>(text, {
//           header: true,
//           skipEmptyLines: true,
//           dynamicTyping: false,
//         });
//         if (parseResult.errors.length) {
//           // If parse errors, we don't block upload; just note errors; duplicates cannot be computed reliably.
//           this.inputErrors = parseResult.errors.map(
//             (e) => `Row ${e.row}: ${e.message}`
//           );
//           // duplicateAuthorCount stays 0
//         } else {
//           const rawRows = parseResult.data as Array<{ [key: string]: string }>;
//           if (rawRows.length) {
//             // Determine author field name:
//             const fields = parseResult.meta.fields || [];
//             const authorField = fields.includes('author_name')
//               ? 'author_name'
//               : fields.includes('author')
//               ? 'author'
//               : 'author_name';

//             // Filter non-blank authorName rows
//             const filteredRows = rawRows.filter((row) => {
//               const val = row[authorField];
//               return typeof val === 'string' && val.trim() !== '';
//             });

//             // Build the array of authorName strings
//             const names = filteredRows.map((row) =>
//               (row[authorField] || '').trim()
//             );
//             // Count duplicates
//             const seen = new Set<string>();
//             let dupCount = 0;
//             for (const name of names) {
//               const key = name.trim().toLowerCase();
//               if (seen.has(key)) {
//                 dupCount++;
//               } else {
//                 seen.add(key);
//               }
//             }
//             this.duplicateAuthorCount = dupCount;
//           }
//         }
//       }
//       // rawData is set; duplicateAuthorCount updated. UI template can now show this info.
//     };
//     reader.readAsText(file);
//   }

//   processTextInput() {
//     if (!this.rawData?.trim()) return;

//     if (this.mode === 'taxon') {
//       // ... unchanged taxon branch ...
//     } else {
//       if (!this.rawData.trim()) {
//         return;
//       }

//       // Use PapaParse to read the CSV, with header:true so we can reference columns by name.
//       const parseResult = Papa.parse<{ [key: string]: string }>(this.rawData, {
//         header: true,
//         skipEmptyLines: true,
//         dynamicTyping: false,
//       });

//       if (parseResult.errors.length) {
//         // Map PapaParse errors into user‐friendly messages
//         this.inputErrors = parseResult.errors.map((e) => {
//           return `Row ${e.row}: ${e.message}`;
//         });
//         return;
//       }

//       const rawRows = parseResult.data as Array<{ [key: string]: string }>;
//       if (!rawRows.length) {
//         this.inputErrors = ['No data rows found in CSV.'];
//         return;
//       }

//       // ─── detect which author column to use and filter out rows with blank author ───
//       const fields = parseResult.meta.fields || [];
//       const authorField = fields.includes('author_name')
//         ? 'author_name'
//         : fields.includes('author')
//         ? 'author'
//         : 'author_name';

//       const filteredRows = rawRows.filter((row) => {
//         const val = row[authorField];
//         return typeof val === 'string' && val.trim() !== '';
//       });

//       if (!filteredRows.length) {
//         this.inputErrors = [
//           `CSV parsed, but "${authorField}" was empty on every row.`,
//         ];
//         return;
//       }
//       // ────────────────────────────────────────────────────────────────────────────────

//       // Map each filtered row into our TaxonRecord shape.
//       const authors: TaxonRecord[] = filteredRows.map((row) => {
//         const authorName = (row[authorField] || '').trim();
//         return {
//           authorName,
//           authorForename: (row['author_forename'] || '').trim() || undefined,
//           authorSurname: (row['author_surname'] || '').trim() || undefined,
//           standardForm: (row['standard_form'] || '').trim() || undefined,
//           scientificName: (row['scientific_name'] || '').trim() || undefined,
//         };
//       });

//       // ─── Deduplicate exact identical authorName entries ───
//       const seen = new Set<string>();
//       const uniqueAuthors: TaxonRecord[] = [];
//       for (const a of authors) {
//         // const key = a.authorName.trim().toLowerCase();
//         const key = a.authorName.trim();
//         if (!seen.has(key)) {
//           seen.add(key);
//           uniqueAuthors.push(a);
//         }
//       }
//       if (uniqueAuthors.length < authors.length) {
//         // we already computed duplicateAuthorCount in handleFileUpload, but for safety:
//         const removed = authors.length - uniqueAuthors.length;
//         console.log(
//           `DataInputComponent: removed ${removed} duplicate author records before processing.`
//         );
//       }
//       // ────────────────────────────────────────────────────────────────

//       if (!uniqueAuthors.length) {
//         this.inputErrors = [
//           `CSV parsed, but no unique non-blank authorName rows remain after deduplication.`,
//         ];
//         return;
//       }

//       // Emit using uniqueAuthors
//       const payload: DataLoadEvent = {
//         data: uniqueAuthors,
//         source: 'text-input',
//       };
//       this.dataLoaded.emit(payload);
//       this.inputErrors = [];
//     }
//   }

//   private getErrorMessage(error: unknown): string {
//     if (error instanceof SyntaxError) {
//       return 'Invalid JSON syntax - check for missing commas or quotes';
//     }
//     if (error instanceof Error) {
//       return error.message;
//     }
//     return 'Unknown error parsing JSON';
//   }
// }

/////////////////////////////////////////////////////////////////////////////

import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CleanMode,
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
  @Input() mode!: CleanMode;
  @Output() dataLoaded = new EventEmitter<DataLoadEvent>();

  rawData = '';
  inputErrors: string[] = [];
  duplicateAuthorCount: number = 0;
  lastUploadName: string | null = null;

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.lastUploadName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.rawData = text;
      this.inputErrors = [];
      this.duplicateAuthorCount = 0;

      if (this.mode === 'taxon') {
        // JSON mode validation
        try {
          JSON.parse(text);
        } catch {
          this.rawData = '';
          this.inputErrors = ['Invalid JSON file format'];
        }
      } else {
        // CSV mode - enhanced parsing and duplicate detection
        this.analyzeCsvData(text);
      }
    };
    reader.readAsText(file);
  }

  private analyzeCsvData(text: string) {
    const parseResult = this.parseCSVWithFallback(text);

    if (!parseResult.success) {
      this.inputErrors = parseResult.errors;
      return;
    }

    const { data: rawRows, meta } = parseResult.result;

    if (!rawRows.length) {
      this.inputErrors = ['No data rows found in CSV.'];
      return;
    }

    // Determine author field name with better detection
    const fields = meta.fields || [];
    const authorField = this.detectAuthorField(fields);

    if (!authorField) {
      this.inputErrors = [
        'No author column found. Expected columns: "author_name", "author", or single column CSV with author names.',
      ];
      return;
    }

    // Extract and count author names
    const authorNames = this.extractAuthorNames(rawRows, authorField);

    if (authorNames.length === 0) {
      this.inputErrors = [
        `CSV parsed, but "${authorField}" column contains no valid author names.`,
      ];
      return;
    }

    // Count duplicates (case-insensitive)
    this.duplicateAuthorCount = this.countDuplicates(authorNames);
  }

  private parseCSVWithFallback(text: string): {
    success: boolean;
    result?: any;
    errors: string[];
  } {
    const trimmedText = text.trim();

    // First, let's detect if this might be a single column CSV
    const lines = trimmedText.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) {
      return {
        success: false,
        errors: ['Empty file or no valid lines found.'],
      };
    }

    // Strategy 1: Try with auto-detection but ignore delimiter errors
    try {
      const result = Papa.parse<{ [key: string]: string }>(trimmedText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header: string) => header.trim(),
        quoteChar: '"',
        escapeChar: '"',
      });

      // Check if we got meaningful data even with delimiter warnings
      if (
        result.data &&
        result.data.length > 0 &&
        result.meta.fields &&
        result.meta.fields.length > 0
      ) {
        // Filter out only critical errors, ignore delimiter detection warnings
        const criticalErrors = result.errors.filter(
          (error) =>
            error.type !== 'Delimiter' && error.code !== 'UndetectableDelimiter'
        );

        if (criticalErrors.length === 0) {
          return { success: true, result, errors: [] };
        }
      }
    } catch (error) {
      // Continue to fallback strategies
    }

    // Strategy 2: Try assuming it's a single column (newline-separated values)
    if (this.looksLikeSingleColumn(lines)) {
      try {
        const singleColumnResult = this.parseSingleColumnCSV(lines);
        return { success: true, result: singleColumnResult, errors: [] };
      } catch (error) {
        // Continue to next strategy
      }
    }

    // Strategy 3: Try common delimiters explicitly
    const delimiters = [',', '\t', ';', '|'];
    for (const delimiter of delimiters) {
      try {
        const result = Papa.parse<{ [key: string]: string }>(trimmedText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          delimiter: delimiter,
          transformHeader: (header: string) => header.trim(),
          quoteChar: '"',
          escapeChar: '"',
        });

        if (
          result.data &&
          result.data.length > 0 &&
          result.meta.fields &&
          result.meta.fields.length > 0
        ) {
          const nonDelimiterErrors = result.errors.filter(
            (error) => error.type !== 'Delimiter'
          );
          if (nonDelimiterErrors.length === 0) {
            return { success: true, result, errors: [] };
          }
        }
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      errors: [
        'Unable to parse CSV. Please check file format and ensure proper delimiter usage.',
      ],
    };
  }

  private looksLikeSingleColumn(lines: string[]): boolean {
    if (lines.length < 2) return false;

    // Check if first line looks like a header and subsequent lines look like data
    const firstLine = lines[0].trim();
    const hasCommas = lines.some((line) => line.includes(','));
    const hasTabs = lines.some((line) => line.includes('\t'));

    // If no common delimiters found and we have multiple lines, likely single column
    return !hasCommas && !hasTabs && lines.length > 1;
  }

  private parseSingleColumnCSV(lines: string[]): any {
    const headerLine = lines[0].trim();
    const dataLines = lines.slice(1);

    // Remove quotes from header if present
    const cleanHeader = headerLine.replace(/^["']|["']$/g, '').trim();
    const fieldName = cleanHeader || 'author_name';

    const data = dataLines
      .map((line) => {
        const cleanLine = line.trim().replace(/^["']|["']$/g, '');
        return { [fieldName]: cleanLine };
      })
      .filter((row) => Object.values(row)[0]); // Filter out empty rows

    return {
      data,
      meta: {
        fields: [fieldName],
      },
      errors: [],
    };
  }

  private detectAuthorField(fields: string[]): string | null {
    // Priority order for author field detection
    const authorFieldOptions = ['author_name', 'author', 'name'];

    for (const option of authorFieldOptions) {
      if (fields.includes(option)) {
        return option;
      }
    }

    // If single column, use the first field as author field
    if (fields.length === 1) {
      return fields[0];
    }

    return null;
  }

  private extractAuthorNames(
    rows: Array<{ [key: string]: string }>,
    authorField: string
  ): string[] {
    return rows
      .map((row) => {
        const value = row[authorField] || '';
        // Handle quoted values and trim
        return value.replace(/^["']|["']$/g, '').trim();
      })
      .filter((name) => name.length > 0);
  }

  private countDuplicates(names: string[]): number {
    const seen = new Set<string>();
    let duplicateCount = 0;

    for (const name of names) {
      const normalizedName = name.trim().toLowerCase();
      if (seen.has(normalizedName)) {
        duplicateCount++;
      } else {
        seen.add(normalizedName);
      }
    }

    return duplicateCount;
  }

  processTextInput() {
    if (!this.rawData?.trim()) return;

    if (this.mode === 'taxon') {
      // Handle taxon mode (JSON processing)
      this.processTaxonData();
    } else {
      // Handle author mode (CSV processing)
      this.processAuthorData();
    }
  }

  private processTaxonData() {
    try {
      const jsonData = JSON.parse(this.rawData);
      // Process JSON data as needed
      const payload: DataLoadEvent = {
        data: jsonData,
        source: 'text-input',
      };
      this.dataLoaded.emit(payload);
      this.inputErrors = [];
    } catch (error) {
      this.inputErrors = [this.getErrorMessage(error)];
    }
  }

  private processAuthorData() {
    const parseResult = this.parseCSVWithFallback(this.rawData);

    if (!parseResult.success) {
      this.inputErrors = parseResult.errors;
      return;
    }

    const { data: rawRows, meta } = parseResult.result;

    if (!rawRows.length) {
      this.inputErrors = ['No data rows found in CSV.'];
      return;
    }

    // Detect author field
    const fields = meta.fields || [];
    const authorField = this.detectAuthorField(fields);

    if (!authorField) {
      this.inputErrors = [
        'No author column found. Expected columns: "author_name", "author", or single column CSV.',
      ];
      return;
    }

    // Filter rows with valid author names
    const validRows = rawRows.filter((row: { [x: string]: any }) => {
      const authorName = (row[authorField] || '')
        .replace(/^["']|["']$/g, '')
        .trim();
      return authorName.length > 0;
    });

    if (!validRows.length) {
      this.inputErrors = [
        `CSV parsed, but "${authorField}" column contains no valid author names.`,
      ];
      return;
    }

    // Create TaxonRecord objects and deduplicate by author name only
    const authors = this.createTaxonRecords(validRows, authorField);
    const uniqueAuthors = this.deduplicateByAuthorName(authors);

    if (!uniqueAuthors.length) {
      this.inputErrors = ['No unique author names found after deduplication.'];
      return;
    }

    // Log deduplication results
    const removedCount = authors.length - uniqueAuthors.length;
    if (removedCount > 0) {
      console.log(
        `DataInputComponent: Removed ${removedCount} duplicate author records during processing.`
      );
    }

    // Emit the processed data
    const payload: DataLoadEvent = {
      data: uniqueAuthors,
      source: 'text-input',
    };
    this.dataLoaded.emit(payload);
    this.inputErrors = [];
  }

  private createTaxonRecords(
    rows: Array<{ [key: string]: string }>,
    authorField: string
  ): TaxonRecord[] {
    return rows.map((row) => {
      // Clean quoted values from all fields
      const cleanValue = (fieldValue: string) => {
        return (
          (fieldValue || '').replace(/^["']|["']$/g, '').trim() || undefined
        );
      };

      return {
        authorName: cleanValue(row[authorField]) || '',
        authorForename: cleanValue(row['author_forename']),
        authorSurname: cleanValue(row['author_surname']),
        standardForm: cleanValue(row['standard_form']),
        scientificName: cleanValue(row['scientific_name']),
      };
    });
  }

  private deduplicateByAuthorName(authors: TaxonRecord[]): TaxonRecord[] {
    const seen = new Set<string>();
    const uniqueAuthors: TaxonRecord[] = [];

    for (const author of authors) {
      // Use case-insensitive comparison for deduplication
      const normalizedName = author.authorName.trim().toLowerCase();

      if (!seen.has(normalizedName)) {
        seen.add(normalizedName);
        uniqueAuthors.push(author);
      }
    }

    return uniqueAuthors;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof SyntaxError) {
      return 'Invalid JSON syntax - check for missing commas or quotes';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error parsing data';
  }
}
