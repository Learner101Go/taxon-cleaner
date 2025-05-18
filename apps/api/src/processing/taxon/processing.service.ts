// src/processing/taxon/processing.service.ts
import { Injectable } from '@nestjs/common';
// import { TaxonRecord } from '@symbiota2/api-common'; /// TODO: FIX THIS LATER

import { AuthorService } from '../author/author.service';
import { CoordinateService } from '../coordinate/coordinate.service';
import { TaxonService } from './taxon.service';
import {
  AuthorResult,
  CleaningResult,
  CoordResult,
  TaxonRecord,
  TaxonResult,
} from '../../shared/types';
import { CoordinateValidationResult } from '../coordinate/coordinate.interface';
import { TaxonResolution } from './taxon.interface';

@Injectable()
export class ProcessingService {
  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService
  ) {}

  async processRecord(
    record: TaxonRecord,
    source: string // Add source parameter
  ) {
    // Type assertions for service results
    const authorResult: AuthorResult = (await this.authorService.normalize(
      record.scientificNameAuthorship
    )) as AuthorResult;
    const coordResult = await this.coordinateService.validate(
      record.decimalLatitude,
      record.decimalLongitude
    );
    const taxonResult = (await this.taxonService.resolveTaxon(
      record.scientificName,
      source // Pass source parameter
    )) as TaxonResolution;

    return {
      original: record,
      issues: [
        ...authorResult.issues,
        ...coordResult.issues,
        ...taxonResult.issues,
      ],
      suggestions: [...authorResult.suggestions, ...taxonResult.suggestions],
    };
  }
}
