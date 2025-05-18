// src/processing/coordinate/coordinate.interface.ts
export interface CoordinateIssue {
  type: 'invalid' | 'out_of_bounds' | 'precision';
  message: string;
  field: 'latitude' | 'longitude';
  originalValue: number;
  suggestedValue?: number;
}

export interface CoordinateValidationResult {
  valid: boolean;
  issues: CoordinateIssue[];
}

export interface CoordinateValidationResult {
  issues: CoordinateIssue[];
  valid: boolean;
}
