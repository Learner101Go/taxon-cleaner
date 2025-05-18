// import { Injectable } from '@nestjs/common';
// import { AuthorNormalizationService } from './author-normalization.service';
// import { CoordinateValidationService } from './coordinate-validation.service';
// import { TaxonResolutionService } from './taxon-resolution.service';

// /**
//  * Main data cleaning engine with multiple validation pipelines
//  */
// @Injectable()
// export class TaxonProcessorService {
//   constructor(
//     private authorNormalizer: AuthorNormalizationService,
//     private coordinateValidator: CoordinateValidationService,
//     private taxonResolver: TaxonResolutionService
//   ) {}

//   /**
//    * Full cleaning pipeline for a single record
//    * @param record Input taxon record
//    * @param source Data source context
//    * @returns Cleaning result with suggestions
//    */
//   // async processRecord(
//   //   record: TaxonRecord,
//   //   source: DataSource
//   // ): Promise<CleaningResult> {
//   //   // Parallel execution of cleaning modules
//   //   const [authorshipResult, coordinateResult, taxonResult] = await Promise.all(
//   //     [
//   //       this.authorNormalizer.processAuthorship(record),
//   //       this.coordinateValidator.validate(record),
//   //       this.taxonResolver.resolveTaxon(record, source),
//   //     ]
//   //   );

//   //   return {
//   //     original: record,
//   //     issues: [
//   //       ...authorshipResult.issues,
//   //       ...coordinateResult.issues,
//   //       ...taxonResult.issues,
//   //     ],
//   //     suggestions: [
//   //       ...authorshipResult.suggestions,
//   //       ...taxonResult.suggestions,
//   //     ],
//   //     metadata: {
//   //       source,
//   //       processedAt: new Date().toISOString(),
//   //     },
//   //   };
//   // }
// }
