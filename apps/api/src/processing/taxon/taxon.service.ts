import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TaxonResolution, TaxonSuggestion } from './taxon.interface';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class TaxonService {
  private readonly GBIF_API = 'https://api.gbif.org/v1';

  constructor(private http: HttpService, private config: ConfigService) {}

  async resolveTaxon(name: string, source: string): Promise<TaxonResolution> {
    const result: TaxonResolution = {
      originalName: name,
      confidence: 0,
      source: 'gbif',
      taxonomicStatus: 'unknown',
      rank: 'unknown',
      rankMatch: false,
      issues: [],
      suggestions: [],
    };

    try {
      const response = await this.http
        .get(`${this.GBIF_API}/species/match`, { params: { name } })
        .toPromise();

      const data = response.data;

      result.matchedName = data.scientificName;
      result.acceptedName = data.acceptedScientificName;
      result.confidence = data.confidence;
      result.taxonomicStatus = data.status;
      result.rankMatch = data.rank === data.usage.rank;

      if (data.synonym) {
        result.issues.push('Potential synonym');
      }
    } catch (error) {
      result.issues.push('Resolution service unavailable');
    }

    return result;
  }

  getSuggestions(resolution: TaxonResolution): TaxonSuggestion[] {
    const suggestions: TaxonSuggestion[] = [];

    if (resolution.taxonomicStatus === 'SYNONYM') {
      suggestions.push({
        type: 'synonym',
        value: resolution.acceptedName,
        confidence: resolution.confidence,
        referenceUrl: `https://www.gbif.org/species/${resolution.acceptedName}`,
      });
    }

    if (!resolution.rankMatch) {
      suggestions.push({
        type: 'rank',
        value: `Update rank to ${resolution.rank}`,
        confidence: 0.8,
      });
    }

    return suggestions;
  }
}
