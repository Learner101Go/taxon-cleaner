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
  [key: string]: any; // Allow for dynamic fields
}

export interface JobData {
  jobGroupId?: string;
  records: TaxonRecord[];
  chunks?: TaxonRecord[][];
  source: string;
  chunkSize: number;
  chunkIndex?: number;
  confidenceThreshold?: number;
  autoCorrectAuthors?: boolean;
  validateCoordinates?: boolean;
  resolveTaxonomy?: boolean;
  processedChunks?: any;
  parentJobId?: string;
  isParent?: boolean;
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

export interface JobProgress {
  chunks: Array<CleaningResult[] | null>;
  currentChunk: number;
  totalChunks: number;
}

// ----- Issue Types -----
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

export type JobStatus =
  | 'completed'
  | 'delayed'
  | 'failed'
  | 'wait'
  | 'prioritized'
  | 'paused'
  | 'active';

export interface TaxonIssue extends Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

// ----- Suggestion Types -----
export interface AuthorSuggestion {
  type: 'author';
  confidence: number; // 0.0–1.0
  correctedAuthor: string; // e.g. "M.E. Barkworth"
  source?: 'ipni' | 'pterido';
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

// ----- Module Result Wrappers -----
export interface AuthorResult {
  original?: string;
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
  original: TaxonRecord;
  issues: Issue[];
  suggestions: (AuthorSuggestion | CoordSuggestion | TaxonSuggestion)[];
  accepted?: TaxonRecord; // Full TaxonRecord, not Partial
  metadata?: {
    timestamp?: string;
    processedBy?: string;
    autoApplied?: boolean;
  };
}

export interface CreateJobResponseDto {
  jobIds: string[];
  totalChunks: number;
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
