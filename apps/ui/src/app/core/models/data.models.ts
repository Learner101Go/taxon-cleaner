export interface CleaningChunk {
  original: TaxonRecord;
  results: CleaningResult[];
  totalChunks: number;
  currentChunk: number;
}

export interface CleaningSettings {
  autoCorrectAuthors: boolean;
  validateCoordinates: boolean;
  resolveTaxonomy: boolean;
  chunkSize: number;
  confidenceThreshold: number;
  inputMethod?: string[];
  sources?: string[];
  currentSource: string;
}

export interface TaxonRecord {
  scientificName: string;
  scientificNameAuthorship?: string;
  taxonRank?: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  geodeticDatum?: string;
  family?: string;
  genus?: string;
  specificEpithet?: string;
  infraspecificEpithet?: string;
  recordedBy?: string;
  occurrenceID?: string;
  eventDate?: string;
  // Additional Darwin Core fields as needed
}

// ----- Issue Types -----
export interface AuthorIssue {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CoordIssue {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TaxonIssue {
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ----- Suggestion Types -----
export interface AuthorSuggestion {
  type: 'author-normalization';
  confidence: number; // 0.0–1.0
  value: string; // e.g. "M.E. Barkworth"
}

export interface CoordSuggestion {
  type: 'coordinate-correction' | 'coordinate-precision';
  confidence: number;
  value: Partial<{ decimalLatitude: number; decimalLongitude: number }>;
}

export interface TaxonSuggestion {
  type: 'taxon-resolution';
  confidence: number;
  value: Partial<{
    scientificName: string;
    taxonRank: string;
    acceptedNameUsageID: string;
  }>;
}

export interface CleaningResult {
  original: TaxonRecord;
  issues: (AuthorIssue | CoordIssue | TaxonIssue)[];
  suggestions: (AuthorSuggestion | CoordSuggestion | TaxonSuggestion)[];
  accepted?: Partial<TaxonRecord>;
  metadata?: {
    timestamp?: string;
    processedBy?: string;
    autoApplied?: boolean;
  };
}

export interface CreateJobResponseDto {
  jobId: string;
  totalChunks: number;
}

export interface JobProgress {
  chunks: CleaningResult[][];
  currentChunk: number;
  totalChunks: number;
}

// Optional: For strong typing of data sources
export interface DataSourceConfig {
  name: string;
  enabled: boolean;
  endpoint?: string;
}

export interface DataLoadEvent {
  data: TaxonRecord[];
  source: 'file-upload' | 'text-input';
}

// The server’s response to POST /jobs
export interface CreateJobResponse {
  jobIds: string[];
  totalChunks: number;
}

// export interface CreateJobResponseDto {
//   jobId: string; // Single ID now
//   totalChunks: number;
// }

// export interface JobProgress {
//   chunks: (CleaningResult[] | null)[];
//   currentChunk: number;
//   totalChunks: number;
// }

export function isAuthorSuggestion(
  suggestion: any
): suggestion is AuthorSuggestion {
  return suggestion.type === 'author-normalization';
}

export function isCoordSuggestion(
  suggestion: any
): suggestion is CoordSuggestion {
  return ['coordinate-correction', 'coordinate-precision'].includes(
    suggestion.type
  );
}

export function isTaxonSuggestion(
  suggestion: any
): suggestion is TaxonSuggestion {
  return suggestion.type === 'taxon-resolution';
}
