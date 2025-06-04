// // src/processing/taxon/processing.service.ts
// import { Injectable } from '@nestjs/common';
// // import { TaxonRecord } from '@symbiota2/api-common'; /// TODO: FIX THIS LATER

// import { AuthorService } from '../author/author.service';
// import { CoordinateService } from '../coordinate/coordinate.service';
// import { TaxonService } from './taxon.service';
// import {
//   AuthorResult,
//   CleaningResult,
//   CoordResult,
//   TaxonRecord,
//   TaxonResult,
// } from '../../shared/types';
// import { CoordinateValidationResult } from '../coordinate/coordinate.interface';
// import { TaxonResolution } from './taxon.interface';

// @Injectable()
// export class ProcessingService {
//   constructor(
//     private readonly authorService: AuthorService,
//     private readonly coordinateService: CoordinateService,
//     private readonly taxonService: TaxonService
//   ) {}

//   async processRecord(
//     record: TaxonRecord,
//     source: string // Add source parameter
//   ) {
//     // Type assertions for service results
//     const authorResult: AuthorResult = (await this.authorService.normalize(
//       record.scientificNameAuthorship
//     )) as AuthorResult;
//     const coordResult = await this.coordinateService.validate(
//       record.decimalLatitude,
//       record.decimalLongitude
//     );
//     const taxonResult = (await this.taxonService.resolveTaxon(
//       record.scientificName,
//       source // Pass source parameter
//     )) as TaxonResult;

//     return {
//       original: record,
//       issues: [
//         ...authorResult.issues,
//         ...coordResult.issues,
//         ...taxonResult.issues,
//       ],
//       suggestions: [...authorResult.suggestions, ...taxonResult.suggestions],
//     };
//   }
// }

//////////////////////////////////////////////

// src/processing/taxon/processing.service.ts

import { Injectable } from '@nestjs/common';
import { AuthorService } from '../author/author.service';
import { CoordinateService } from '../coordinate/coordinate.service';
import { TaxonService } from './taxon.service';
import {
  CleaningResult,
  TaxonRecord,
  AuthorResult,
  AuthorSuggestion,
  CoordSuggestion,
  TaxonSuggestion,
  CoordResult,
  TaxonResult,
  Issue,
} from '../../shared/types';

@Injectable()
export class ProcessingService {
  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService
  ) {}

  /**
   * Processes a single TaxonRecord by:
   *   1) Running authorService.normalizeAll(...)
   *   2) Running coordinateService.validate(...)
   *   3) Running taxonService.resolveTaxon(...)
   * Collects all issues & suggestions, then auto‐applies the highest‐confidence suggestion
   * for each category (author, coordinate, taxon).
   */
  async processRecord(
    record: TaxonRecord,
    source: string
  ): Promise<CleaningResult> {
    // We'll gather all issues and suggestions here:
    const allIssues: Issue[] = [];
    const allSuggestions: (
      | AuthorSuggestion
      | CoordSuggestion
      | TaxonSuggestion
    )[] = [];

    // Start with a shallow copy as “accepted”
    const accepted: TaxonRecord = { ...record };

    // 1) AUTHOR NORMALIZATION (if there's an authorship string)
    if (record.scientificNameAuthorship) {
      // normalizeAll(...) returns one AuthorResult per token (e.g. “L.”, “Smith”, etc.)
      const authorResults: AuthorResult[] =
        await this.authorService.normalizeAll(record.scientificNameAuthorship);

      // Collect every token’s issues & suggestions
      authorResults.forEach((ar) => {
        allIssues.push(...ar.issues);
        allSuggestions.push(...ar.suggestions);
      });

      // Find the single AuthorSuggestion with highest confidence (if any)
      const bestAuthorSuggestion = authorResults
        .flatMap((ar) => ar.suggestions)
        .sort((a, b) => b.confidence - a.confidence)[0];

      if (bestAuthorSuggestion) {
        // Auto‐apply that best correction
        accepted.scientificNameAuthorship =
          bestAuthorSuggestion.correctedAuthor;
      }
    }

    // 2) COORDINATE VALIDATION (if numeric latitude/longitude exist)
    if (record.decimalLatitude != null && record.decimalLongitude != null) {
      const coordResult: CoordResult = await this.coordinateService.validate(
        record.decimalLatitude,
        record.decimalLongitude
      );

      allIssues.push(...coordResult.issues);
      allSuggestions.push(...coordResult.suggestions);

      // Auto‐apply the top coordinate suggestion if present
      if (coordResult.suggestions.length > 0) {
        const bestCoord = coordResult.suggestions[0];
        accepted.decimalLatitude = bestCoord.suggestedLat;
        accepted.decimalLongitude = bestCoord.suggestedLng;
      }
    }

    // 3) TAXON RESOLUTION (if a scientificName is present)
    if (record.scientificName) {
      const taxonResult: TaxonResult = await this.taxonService.resolveTaxon(
        record.scientificName,
        source
      );

      allIssues.push(...taxonResult.issues);

      // Convert that TaxonResult into an array of TaxonSuggestion
      const taxonSuggestions: TaxonSuggestion[] =
        this.taxonService.getSuggestions(taxonResult);

      allSuggestions.push(...taxonSuggestions);

      // Auto‐apply the highest‐confidence taxon suggestion if present
      if (taxonSuggestions.length > 0) {
        const bestTaxon = taxonSuggestions[0];
        if (bestTaxon.acceptedName) {
          accepted.scientificName = bestTaxon.acceptedName;
        }
        if (bestTaxon.family) {
          accepted.family = bestTaxon.family;
        }
        if (bestTaxon.genus) {
          accepted.genus = bestTaxon.genus;
        }
      }
    }

    // Finally, return a CleaningResult that includes everything
    return {
      original: record,
      issues: allIssues,
      suggestions: allSuggestions,
      accepted,
      metadata: {
        timestamp: new Date().toISOString(),
        processedBy: 'processor',
        autoApplied: true,
      },
    };
  }
}
