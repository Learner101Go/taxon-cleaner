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
