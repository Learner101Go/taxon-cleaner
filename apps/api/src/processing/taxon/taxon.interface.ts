export interface TaxonResolution {
  originalName: string;
  matchedName?: string;
  acceptedName?: string;
  confidence: number;
  source: 'gbif' | 'col' | 'itis';
  taxonomicStatus: string;
  rank: string;
  rankMatch: boolean;
  issues: string[];
  suggestions: TaxonSuggestion[];
}

export interface TaxonSuggestion {
  type: 'synonym' | 'rank' | 'spelling';
  value: string;
  confidence: number;
  referenceUrl?: string;
}
