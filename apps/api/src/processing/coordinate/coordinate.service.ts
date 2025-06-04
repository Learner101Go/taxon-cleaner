// import { Injectable } from '@nestjs/common';
// import {
//   CoordinateIssue,
//   CoordinateValidationResult,
// } from './coordinate.interface';
// import { ConfigService } from '@nestjs/config/dist/config.service';

// @Injectable()
// export class CoordinateService {
//   private readonly decimalPrecision: number;

//   constructor(private config: ConfigService) {
//     this.decimalPrecision = this.config.get('coordinatePrecision') || 6;
//   }

//   validate(
//     decimalLatitude?: number,
//     decimalLongitude?: number
//   ): CoordinateValidationResult {
//     const issues: CoordinateIssue[] = [];

//     // Validate latitude
//     if (decimalLatitude !== undefined) {
//       if (isNaN(decimalLatitude)) {
//         issues.push(this.createIssue('invalid', 'latitude', decimalLatitude));
//       } else if (Math.abs(decimalLatitude) > 90) {
//         issues.push(
//           this.createIssue(
//             'out_of_bounds',
//             'latitude',
//             decimalLatitude,
//             Math.max(-90, Math.min(90, decimalLatitude))
//           )
//         );
//       }
//     }

//     // Validate longitude
//     if (decimalLongitude !== undefined) {
//       if (isNaN(decimalLongitude)) {
//         issues.push(this.createIssue('invalid', 'longitude', decimalLongitude));
//       } else if (Math.abs(decimalLongitude) > 180) {
//         issues.push(
//           this.createIssue(
//             'out_of_bounds',
//             'longitude',
//             decimalLongitude,
//             Math.max(-180, Math.min(180, decimalLongitude))
//           )
//         );
//       }
//     }

//     // Check precision
//     if (decimalLatitude && decimalLongitude) {
//       const precisionIssues = this.checkPrecision(
//         decimalLatitude,
//         decimalLongitude
//       );
//       issues.push(...precisionIssues);
//     }

//     return {
//       valid: issues.length === 0,
//       issues,
//     };
//   }

//   private checkPrecision(lat: number, lng: number): CoordinateIssue[] {
//     const issues: CoordinateIssue[] = [];
//     const roundedLat = parseFloat(lat.toFixed(this.decimalPrecision));
//     const roundedLng = parseFloat(lng.toFixed(this.decimalPrecision));

//     if (roundedLat !== lat) {
//       issues.push({
//         type: 'precision',
//         message: `Latitude precision exceeds ${this.decimalPrecision} decimals`,
//         field: 'latitude',
//         originalValue: lat,
//         suggestedValue: roundedLat,
//       });
//     }

//     if (roundedLng !== lng) {
//       issues.push({
//         type: 'precision',
//         message: `Longitude precision exceeds ${this.decimalPrecision} decimals`,
//         field: 'longitude',
//         originalValue: lng,
//         suggestedValue: roundedLng,
//       });
//     }

//     return issues;
//   }

//   private createIssue(
//     type: CoordinateIssue['type'],
//     field: 'latitude' | 'longitude',
//     original: number,
//     suggested?: number
//   ): CoordinateIssue {
//     const messages = {
//       invalid: `Invalid ${field} value`,
//       out_of_bounds: `${field} out of valid range`,
//       precision: `${field} precision too high`,
//     };

//     return {
//       type,
//       message: messages[type],
//       field,
//       originalValue: original,
//       suggestedValue: suggested,
//     };
//   }
// }

import { Injectable } from '@nestjs/common';
import { CoordResult, CoordSuggestion, CoordIssue } from '../../shared/types';

@Injectable()
export class CoordinateService {
  async validate(lat: number, lng: number): Promise<CoordResult> {
    const issues: CoordIssue[] = [];
    const suggestions: CoordSuggestion[] = [];

    // Validate latitude range
    if (lat < -90 || lat > 90) {
      issues.push({
        type: 'error',
        message: `Invalid latitude: ${lat}. Must be between -90 and 90`,
        field: 'latitude',
      });
    }

    // Validate longitude range
    if (lng < -180 || lng > 180) {
      issues.push({
        type: 'error',
        message: `Invalid longitude: ${lng}. Must be between -180 and 180`,
        field: 'longitude',
      });
    }

    // Check for suspicious coordinates (0,0)
    if (lat === 0 && lng === 0) {
      issues.push({
        type: 'warning',
        message: 'Coordinates appear to be null island (0,0) - verify location',
      });
    }

    // Check for swapped coordinates (common error)
    if (Math.abs(lat) > Math.abs(lng) && Math.abs(lng) > 90) {
      suggestions.push({
        type: 'coordinate',
        confidence: 0.7,
        suggestedLat: lng,
        suggestedLng: lat,
      });
      issues.push({
        type: 'warning',
        message: 'Coordinates may be swapped (lat/lng)',
      });
    }

    // Check precision (too many decimal places might indicate error)
    const latDecimals = (lat.toString().split('.')[1] || '').length;
    const lngDecimals = (lng.toString().split('.')[1] || '').length;

    if (latDecimals > 6 || lngDecimals > 6) {
      issues.push({
        type: 'info',
        message: 'High precision coordinates detected - verify accuracy',
      });
    }

    return { issues, suggestions };
  }
}
