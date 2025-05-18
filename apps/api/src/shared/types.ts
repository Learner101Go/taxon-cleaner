// src/shared/types.ts
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
}

export interface JobData {
  records: TaxonRecord[];
  chunks?: TaxonRecord[][];
  source: string;
  chunkSize: number;
  processedChunks?: any;
  totalChunks?: number;
  timestamp?: string;
}

export interface DataSettings {
  autoCorrectAuthors: boolean;
  validateCoordinates: boolean;
  resolveTaxonomy: boolean;
  chunkSize: number;
  confidenceThreshold: number;
  currentSource: string;
}

export interface JobResponseDto {
  jobId: string;
  chunkIndex: number;
  source: string;
  records: TaxonRecord[];
}

export interface CreateJobResponseDto {
  jobId: string;
  totalChunks: number;
}

// progress tracking interface
export interface JobProgress {
  chunks: (CleaningResult[] | null)[];
  currentChunk: number;
  totalChunks: number;
}

export interface CoordinateIssue {
  type: string;
  message: string;
  field: 'latitude' | 'longitude';
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

// ----- Module Result Wrappers -----
export interface AuthorResult {
  issues: AuthorIssue[];
  suggestions: AuthorSuggestion[];
}

export interface CoordResult {
  issues: CoordIssue[];
  suggestions: CoordSuggestion[];
}

export interface TaxonResult {
  issues: TaxonIssue[];
  suggestions: TaxonSuggestion[];
}

// ----- Combined Cleaning Result -----
export interface CleaningResult {
  original: TaxonRecord; // assuming TaxonRecord is defined earlier
  issues: (AuthorIssue | CoordIssue | TaxonIssue)[];
  suggestions: (AuthorSuggestion | CoordSuggestion | TaxonSuggestion)[];
  metadata?: Record<string, any>;
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
