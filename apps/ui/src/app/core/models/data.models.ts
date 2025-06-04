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
  id?: number;
  authorName: string;
  authorForename?: string;
  authorSurname?: string;
  standardForm?: string;
  source?: 'ipni' | 'pterido';
  scientificName?: string;
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
  [key: string]: any;
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface AuthorIssue extends Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export interface CoordIssue extends Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: 'latitude' | 'longitude';
}

export interface TaxonIssue extends Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

// ----- Suggestion Types -----
export interface AuthorSuggestion {
  type: 'author';
  confidence: number; // 0.0–1.0
  correctedAuthor: string; // e.g. "M.E. Barkworth"
}

export interface CoordSuggestion {
  type: 'coordinate';
  confidence: number;
  suggestedLat: number;
  suggestedLng: number;
}

export interface TaxonSuggestion {
  type: 'taxon';
  confidence: number;
  scientificName: string;
  acceptedName?: string;
  family?: string;
  genus?: string;
  taxonRank?: string;
  acceptedNameUsageID?: string;
}

export interface CleaningResult {
  original: TaxonRecord;
  issues: Issue[];
  suggestions: (AuthorSuggestion | CoordSuggestion | TaxonSuggestion)[];
  accepted: TaxonRecord;
  metadata?: {
    timestamp?: string;
    processedBy?: string;
    autoApplied?: boolean;
  };
}

export interface CreateJobResponseDto {
  jobIds: string[];
  totalChunks: number;
  totalRecords?: number;
}

export interface JobProgress {
  status: string;
  jobId: string;
  chunks: (CleaningResult[] | null)[];
  currentChunk: number;
  totalChunks: number;
  processedRecords?: any;
  totalRecords?: number;
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

export interface TaxonLoadEvent {
  data: TaxonRecord[];
  source: 'file-upload' | 'text-input';
}

export interface CreateJobResponse {
  jobIds: string[];
  totalChunks: number;
}

export function isAuthorSuggestion(
  suggestion: any
): suggestion is AuthorSuggestion {
  return suggestion.type === 'author';
}

export function isCoordSuggestion(
  suggestion: any
): suggestion is CoordSuggestion {
  return suggestion.type === 'coordinate';
}

export function isTaxonSuggestion(
  suggestion: any
): suggestion is TaxonSuggestion {
  return suggestion.type === 'taxon';
}
