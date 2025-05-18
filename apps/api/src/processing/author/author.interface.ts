export interface AuthorSuggestion {
  original: string;
  normalized: string;
  confidence: number;
  source: 'ipni' | 'local';
}

export interface AuthorValidationResult {
  issues: string[];
  suggestions: AuthorSuggestion[];
}
