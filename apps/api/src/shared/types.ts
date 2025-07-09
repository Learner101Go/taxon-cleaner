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

export interface SessionData {
  sessionId: string;
  records: TaxonRecord[];
  settings: DataSettings;
  totalChunks: number;
  chunkSize: number;
  processedChunks: Map<number, CleaningResult[]>;
  correctedChunks: Map<number, CleaningResult[]>;
  readyChunks: Set<number>;
  currentlyProcessing: Set<number>;
  createdAt: Date;
  lastAccessed: Date;
}

export interface JobData {
  sessionId: string;
  chunkIndex: number;
  records: TaxonRecord[];
  settings: DataSettings;
  totalChunks: number;
}

export interface DataSettings {
  autoCorrectAuthors: boolean;
  validateCoordinates: boolean;
  resolveTaxonomy: boolean;
  chunkSize: number;
  confidenceThreshold: number;
  currentSource: string;
  dataSources?: DataSourcesSettings;
}

export interface DataSourcesSettings {
  useIpni: boolean;
  usePterido: boolean;
}

export interface SessionProgress {
  sessionId: string;
  totalChunks: number;
  readyChunks: number[];
  currentlyProcessing: number[];
  correctedChunks: number[];
  totalRecords: number;
}

export interface CreateSessionResponseDto {
  sessionId: string;
  totalChunks: number;
  totalRecords: number;
}

// Issue Types
export interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface AuthorIssue extends Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
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

// Suggestion Types
export interface AuthorSuggestion {
  type: 'author';
  confidence: number;
  correctedAuthor: string;
  source?: 'ipni' | 'pterido';
  metadata?: AuthorDetail;
}

export interface AuthorDetail {
  matchType?: string;
  ipniId?: number;
  authorId?: number;
  fullName?: string;
  standardForm?: string;
  forename?: string;
  surname?: string;
  isFilius?: boolean;
  distance?: any;
  source?: any;
  originalLength?: number;
  candidateLength?: number;
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

// Result Types
export interface AuthorResult {
  original?: string;
  cleaned?: string;
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

export interface CleaningResult {
  original: TaxonRecord;
  cleaned?: string;
  issues: Issue[];
  suggestions: (AuthorSuggestion | CoordSuggestion | TaxonSuggestion)[];
  accepted: TaxonRecord;
  metadata?: {
    timestamp?: string;
    processedBy?: string;
    autoApplied?: boolean;
    sessionId?: string;
    corrections?: any;
  };
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function normalizeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
