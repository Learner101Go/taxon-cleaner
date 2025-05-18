// // libs/core/src/lib/processing/coordinate-validation.service.ts

// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class CoordinateValidationService {
//   private readonly COORDINATE_PRECISION = 6;

//   validate(record: TaxonRecord): CleaningModuleResult {
//     const issues: DataIssue[] = [];
//     const suggestions: CleaningSuggestion[] = [];

//     // Validate latitude
//     if (record.decimalLatitude) {
//       const lat = parseFloat(record.decimalLatitude.toString());
//       if (isNaN(lat)) {
//         issues.push(this.createIssue('Invalid latitude value', 'error'));
//       } else if (Math.abs(lat) > 90) {
//         issues.push(this.createIssue('Latitude out of bounds', 'error'));
//         suggestions.push({
//           type: 'coordinate-correction',
//           confidence: 1.0,
//           value: { decimalLatitude: Math.max(-90, Math.min(90, lat)) },
//         });
//       }
//     }

//     // Validate longitude
//     if (record.decimalLongitude) {
//       const lng = parseFloat(record.decimalLongitude.toString());
//       if (isNaN(lng)) {
//         issues.push(this.createIssue('Invalid longitude value', 'error'));
//       } else if (Math.abs(lng) > 180) {
//         issues.push(this.createIssue('Longitude out of bounds', 'error'));
//         suggestions.push({
//           type: 'coordinate-correction',
//           confidence: 1.0,
//           value: { decimalLongitude: Math.max(-180, Math.min(180, lng)) },
//         });
//       }
//     }

//     // Precision normalization
//     if (record.decimalLatitude && record.decimalLongitude) {
//       const normalized = {
//         decimalLatitude: parseFloat(
//           record.decimalLatitude.toFixed(this.COORDINATE_PRECISION)
//         ),
//         decimalLongitude: parseFloat(
//           record.decimalLongitude.toFixed(this.COORDINATE_PRECISION)
//         ),
//       };

//       if (
//         JSON.stringify(normalized) !==
//         JSON.stringify({
//           decimalLatitude: record.decimalLatitude,
//           decimalLongitude: record.decimalLongitude,
//         })
//       ) {
//         suggestions.push({
//           type: 'coordinate-precision',
//           confidence: 0.9,
//           value: normalized,
//         });
//       }
//     }

//     return { issues, suggestions };
//   }
// }
