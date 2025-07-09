import { Injectable } from '@nestjs/common';
import { parse as csvParse } from 'papaparse';

@Injectable()
export class DataParser {
  parseCSV(csvData: string): any[] {
    const results = csvParse(csvData, {
      header: true,
      skipEmptyLines: true,
    });
    return results.data;
  }

  parseJSON(jsonData: string): any[] {
    return JSON.parse(jsonData);
  }

  normalizeToDWC(data: any[]): any[] {
    return data.map((item) => ({
      scientificName: item['scientific name'] || item['scientificName'],
      decimalLatitude: parseFloat(item.lat || item.decimalLatitude),
      decimalLongitude: parseFloat(item.lng || item.decimalLongitude),
    }));
  }
}
