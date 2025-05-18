// src/app/core/services/data-source.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { TaxonRecordReplace } from '@symbiota2/ui-common';

type TaxonRecordReplace = any;

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  parser: (raw: any) => TaxonRecordReplace[];
  apiEndpoint?: string;
  isExternal: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DataSourceService {
  private readonly sources = new BehaviorSubject<DataSource[]>([]);
  private readonly currentSource = new BehaviorSubject<DataSource | null>(null);

  sources$ = this.sources.asObservable();
  selectedSource$ = this.currentSource.asObservable();

  constructor() {
    this.initializeDefaultSources();
  }

  private initializeDefaultSources() {
    const defaultSources: DataSource[] = [
      {
        id: 'symbiota2',
        name: 'Symbiota2 Collections',
        description: 'Internal collection database',
        parser: this.parseSymbiotaData.bind(this),
        apiEndpoint: '/api/collections',
        isExternal: false,
      },
      {
        id: 'gbif',
        name: 'GBIF Dataset',
        description: 'Global Biodiversity Information Facility',
        parser: this.parseGBIFData.bind(this),
        isExternal: true,
      },
      {
        id: 'custom',
        name: 'Custom Upload',
        description: 'Upload your own dataset',
        parser: this.parseGenericData.bind(this),
        isExternal: true,
      },
    ];

    this.sources.next(defaultSources);
    this.currentSource.next(defaultSources[0]);
  }

  setSelectedSource(sourceId: string) {
    const source = this.sources.value.find((s) => s.id === sourceId);
    if (source) {
      this.currentSource.next(source);
    }
  }

  addCustomSource(source: DataSource) {
    this.sources.next([...this.sources.value, source]);
    this.currentSource.next(source);
  }

  private parseSymbiotaData(rawData: any): TaxonRecordReplace[] {
    // Symbiota2 specific data transformation
    return rawData.map((item: any) => ({
      scientificName: item.sciname,
      scientificNameAuthorship: item.author,
      taxonRank: item.rank,
      decimalLatitude: item.lat,
      decimalLongitude: item.lng,
      // ... other field mappings
    }));
  }

  private parseGBIFData(rawData: any): TaxonRecordReplace[] {
    // GBIF specific data transformation
    return rawData.map((item: any) => ({
      scientificName: item.scientificName,
      scientificNameAuthorship: item.scientificNameAuthorship,
      taxonRank: item.taxonRank,
      decimalLatitude: item.decimalLatitude,
      decimalLongitude: item.decimalLongitude,
      // ... other field mappings
    }));
  }

  private parseGenericData(rawData: any): TaxonRecordReplace[] {
    // Generic CSV/JSON parser with auto-detection
    try {
      return rawData.map((item: any) => ({
        scientificName: item['scientificName'] || item['Scientific Name'],
        scientificNameAuthorship:
          item['scientificNameAuthorship'] || item['Author'],
        taxonRank: item['taxonRank'] || item['Rank'],
        decimalLatitude: parseFloat(
          item['decimalLatitude'] || item['Latitude']
        ),
        decimalLongitude: parseFloat(
          item['decimalLongitude'] || item['Longitude']
        ),
        // ... other field mappings
      }));
    } catch (e) {
      throw new Error('Failed to parse custom data format');
    }
  }

  getSourceById(sourceId: string): DataSource | undefined {
    return this.sources.value.find((s) => s.id === sourceId);
  }

  validateDataStructure(data: any[], sourceId: string): boolean {
    const source = this.getSourceById(sourceId);
    if (!source) throw new Error('Invalid data source');

    try {
      const parsed = source.parser(data);
      return parsed.every((item) => !!item.scientificName);
    } catch (e) {
      return false;
    }
  }
}
