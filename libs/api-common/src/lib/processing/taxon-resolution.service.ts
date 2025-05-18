// // libs/core/src/lib/processing/taxon-resolution.service.ts

// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class TaxonResolutionService {
//   constructor(
//     private taxonRepository: TaxonRepository,
//     private graphQLService: GraphQLService
//   ) {}

//   async resolveTaxon(
//     record: TaxonRecord,
//     source: DataSource
//   ): Promise<CleaningModuleResult> {
//     const issues: DataIssue[] = [];
//     const suggestions: CleaningSuggestion[] = [];

//     // 1. Validate taxonomic rank structure
//     if (!this.validateRankHierarchy(record)) {
//       issues.push(this.createIssue('Invalid taxonomic hierarchy', 'error'));
//     }

//     // 2. Check against Symbiota2 taxonomy
//     if (source.type === 'symbiota2') {
//       const match = await this.taxonRepository.findClosestMatch(
//         record.scientificName,
//         record.taxonRank
//       );

//       if (match) {
//         suggestions.push(...this.generateTaxonSuggestions(record, match));
//       }
//     }

//     // 3. Validate against GBIF backbone
//     if (source.useGBIF) {
//       const gbifMatch = await this.graphQLService.queryGBIFTaxon(
//         record.scientificName
//       );
//       suggestions.push(...this.processGBIFMatches(gbifMatch));
//     }

//     return { issues, suggestions };
//   }

//   private generateTaxonSuggestions(
//     original: TaxonRecord,
//     match: TaxonMatch
//   ): CleaningSuggestion[] {
//     return [
//       {
//         type: 'taxon-resolution',
//         confidence: match.confidence,
//         value: {
//           scientificName: match.canonicalName,
//           taxonRank: match.rank,
//           acceptedNameUsageID: match.taxonID,
//         },
//       },
//     ];
//   }
// }
