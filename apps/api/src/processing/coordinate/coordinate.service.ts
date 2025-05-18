import { Injectable } from '@nestjs/common';
import {
  CoordinateIssue,
  CoordinateValidationResult,
} from './coordinate.interface';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class CoordinateService {
  private readonly decimalPrecision: number;

  constructor(private config: ConfigService) {
    this.decimalPrecision = this.config.get('coordinatePrecision') || 6;
  }

  validate(
    decimalLatitude?: number,
    decimalLongitude?: number
  ): CoordinateValidationResult {
    const issues: CoordinateIssue[] = [];

    // Validate latitude
    if (decimalLatitude !== undefined) {
      if (isNaN(decimalLatitude)) {
        issues.push(this.createIssue('invalid', 'latitude', decimalLatitude));
      } else if (Math.abs(decimalLatitude) > 90) {
        issues.push(
          this.createIssue(
            'out_of_bounds',
            'latitude',
            decimalLatitude,
            Math.max(-90, Math.min(90, decimalLatitude))
          )
        );
      }
    }

    // Validate longitude
    if (decimalLongitude !== undefined) {
      if (isNaN(decimalLongitude)) {
        issues.push(this.createIssue('invalid', 'longitude', decimalLongitude));
      } else if (Math.abs(decimalLongitude) > 180) {
        issues.push(
          this.createIssue(
            'out_of_bounds',
            'longitude',
            decimalLongitude,
            Math.max(-180, Math.min(180, decimalLongitude))
          )
        );
      }
    }

    // Check precision
    if (decimalLatitude && decimalLongitude) {
      const precisionIssues = this.checkPrecision(
        decimalLatitude,
        decimalLongitude
      );
      issues.push(...precisionIssues);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  private checkPrecision(lat: number, lng: number): CoordinateIssue[] {
    const issues: CoordinateIssue[] = [];
    const roundedLat = parseFloat(lat.toFixed(this.decimalPrecision));
    const roundedLng = parseFloat(lng.toFixed(this.decimalPrecision));

    if (roundedLat !== lat) {
      issues.push({
        type: 'precision',
        message: `Latitude precision exceeds ${this.decimalPrecision} decimals`,
        field: 'latitude',
        originalValue: lat,
        suggestedValue: roundedLat,
      });
    }

    if (roundedLng !== lng) {
      issues.push({
        type: 'precision',
        message: `Longitude precision exceeds ${this.decimalPrecision} decimals`,
        field: 'longitude',
        originalValue: lng,
        suggestedValue: roundedLng,
      });
    }

    return issues;
  }

  private createIssue(
    type: CoordinateIssue['type'],
    field: 'latitude' | 'longitude',
    original: number,
    suggested?: number
  ): CoordinateIssue {
    const messages = {
      invalid: `Invalid ${field} value`,
      out_of_bounds: `${field} out of valid range`,
      precision: `${field} precision too high`,
    };

    return {
      type,
      message: messages[type],
      field,
      originalValue: original,
      suggestedValue: suggested,
    };
  }
}
