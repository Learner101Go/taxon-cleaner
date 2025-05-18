import { Component } from '@angular/core';
import { DataSourceService } from 'apps/ui/src/app/core/services/data-source.service';

// custom source support
const mySource = {
  id: 'inat',
  name: 'iNaturalist',
  parser: (data: any[]) =>
    data.map((obs) => ({
      scientificName: obs.taxon.name,
      decimalLatitude: obs.geojson.coordinates[1],
      decimalLongitude: obs.geojson.coordinates[0],
    })),
  isExternal: true,
};

@Component({
  selector: 'app-data-source',
  template: `
    <mat-form-field>
      <mat-label>Data Source</mat-label>
      <mat-select [(value)]="selectedSourceId">
        <mat-option *ngFor="let source of sources$ | async" [value]="source.id">
          {{ source.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="(selectedSource$ | async)?.isExternal">
      <app-file-upload (upload)="handleUpload($event)"></app-file-upload>
    </div>
  `,
  styleUrls: [],
  standalone: false,
})
export class DataSourceComponent {
  showFileUpload: boolean = false;

  constructor(private dataSourceService: DataSourceService) {
    this.dataSourceService.selectedSource$.subscribe((source) => {
      if (source?.isExternal) {
        this.showFileUpload = true;
      } else {
        this.loadFromAPI(source?.apiEndpoint);
      }
    });
  }

  // When processing data
  processData(rawData: any) {
    // const source = this.dataSourceService.currentSource.value;
    // const parsedData = source.parser(rawData);
    // this.cleaningService.startCleaning(parsedData, source.id);
  }

  loadFromAPI(sourceEndpoint: any) {
    this.dataSourceService.addCustomSource(mySource);
  }
}
