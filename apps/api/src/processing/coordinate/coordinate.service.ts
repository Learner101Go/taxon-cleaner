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
