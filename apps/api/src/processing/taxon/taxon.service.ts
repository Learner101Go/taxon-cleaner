// // api/src/processing/taxon/taxon.service.ts
// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { TaxonResolution, TaxonSuggestion } from './taxon.interface';
// import { ConfigService } from '@nestjs/config/dist/config.service';
// import { lastValueFrom } from 'rxjs';

// @Injectable()
// export class TaxonService {
//   private readonly GBIF_API = 'https://api.gbif.org/v1';

//   constructor(private http: HttpService, private config: ConfigService) {}

//   // async resolveTaxon(name: string, source: string): Promise<TaxonResolution> {
//   //   const result: TaxonResolution = {
//   //     originalName: name,
//   //     confidence: 0,
//   //     source: 'gbif',
//   //     taxonomicStatus: 'unknown',
//   //     rank: 'unknown',
//   //     rankMatch: false,
//   //     issues: [],
//   //     suggestions: [],
//   //   };

//   //   try {
//   //     const response = await this.http
//   //       .get(`${this.GBIF_API}/species/match`, { params: { name } })
//   //       .toPromise();

//   //     const data = response.data;

//   //     result.matchedName = data.scientificName;
//   //     result.acceptedName = data.acceptedScientificName;
//   //     result.confidence = data.confidence;
//   //     result.taxonomicStatus = data.status;
//   //     result.rankMatch = data.rank === data.usage.rank;

//   //     if (data.synonym) {
//   //       result.issues.push('Potential synonym');
//   //     }
//   //   } catch (error) {
//   //     result.issues.push('Resolution service unavailable');
//   //   }

//   //   return result;
//   // }

//   async resolveTaxon(name: string, source: string): Promise<TaxonResolution> {
//     const result: TaxonResolution = {
//       originalName: name,
//       confidence: 0,
//       source: 'gbif',
//       taxonomicStatus: 'unknown',
//       issues: [],
//       suggestions: [],
//       rank: '',
//       rankMatch: false,
//     };

//     try {
//       const { data } = await lastValueFrom(
//         this.http.get(`${this.GBIF_API}/species/match`, {
//           params: { name },
//           timeout: 5000,
//         })
//       );

//       result.matchedName = data.scientificName;
//       result.confidence = data.confidence || 0;

//       if (data.acceptedUsage?.scientificName) {
//         result.acceptedName = data.acceptedUsage.scientificName;
//         result.taxonomicStatus = data.status || 'unknown';
//       }

//       if (data.synonym) {
//         result.issues.push(`Taxon is a synonym of ${result.acceptedName}`);
//       }
//     } catch (error) {
//       result.issues.push('Failed to resolve taxon from GBIF');
//     }

//     return result;
//   }

//   getSuggestions(resolution: TaxonResolution): TaxonSuggestion[] {
//     const suggestions: TaxonSuggestion[] = [];

//     if (resolution.taxonomicStatus === 'SYNONYM') {
//       suggestions.push({
//         type: 'synonym',
//         value: resolution.acceptedName,
//         confidence: resolution.confidence,
//         referenceUrl: `https://www.gbif.org/species/${resolution.acceptedName}`,
//       });
//     }

//     if (!resolution.rankMatch) {
//       suggestions.push({
//         type: 'rank',
//         value: `Update rank to ${resolution.rank}`,
//         confidence: 0.8,
//       });
//     }

//     return suggestions;
//   }
// }

import { Injectable } from '@nestjs/common';
import { TaxonResult, TaxonSuggestion, TaxonIssue } from '../../shared/types';

@Injectable()
export class TaxonService {
  async resolveTaxon(
    scientificName: string,
    source: string
  ): Promise<TaxonResult> {
    const issues: TaxonIssue[] = [];
    const suggestions: TaxonSuggestion[] = [];

    if (!scientificName || scientificName.trim().length === 0) {
      issues.push({
        type: 'error',
        message: 'Scientific name is required',
      });
      return { issues, suggestions };
    }

    const name = scientificName.trim();

    // Basic validation
    if (!name.includes(' ')) {
      issues.push({
        type: 'warning',
        message:
          'Scientific name appears to be incomplete (missing species epithet)',
      });
    }

    // Check for common formatting issues
    if (name !== name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()) {
      const correctedName =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      suggestions.push({
        type: 'taxon',
        confidence: 0.8,
        scientificName: correctedName,
        acceptedName: correctedName,
      });
      issues.push({
        type: 'info',
        message: 'Scientific name formatting corrected',
      });
    }

    // Mock taxonomy resolution (in real implementation, this would query external APIs)
    if (name.toLowerCase().includes('pinus')) {
      suggestions.push({
        type: 'taxon',
        confidence: 0.9,
        scientificName: name,
        family: 'Pinaceae',
        genus: 'Pinus',
      });
    }

    return { issues, suggestions };
  }

  getSuggestions(taxonResult: TaxonResult): TaxonSuggestion[] {
    return taxonResult.suggestions || [];
  }
}
