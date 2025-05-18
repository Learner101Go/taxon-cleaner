// src/app/core/services/validation.service.ts
import { Injectable } from '@angular/core';
import { TaxonRecord } from '../models/data.models';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private requiredFields = ['scientificName'];

  validateRecord(record: TaxonRecord): string[] {
    const errors: string[] = [];

    // Check required fields
    this.requiredFields.forEach((field) => {
      if (!record[field as keyof TaxonRecord]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate coordinates
    if (record.decimalLatitude && Math.abs(record.decimalLatitude) > 90) {
      errors.push('Invalid latitude value');
    }

    if (record.decimalLongitude && Math.abs(record.decimalLongitude) > 180) {
      errors.push('Invalid longitude value');
    }

    return errors;
  }
}
