// apps/cleaning-tool/src/app/modules/cleaning/components/settings-panel/settings-panel.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import {
  CleaningSettings,
  DataSourceConfig,
} from 'apps/ui/src/app/core/models/data.models';

@Component({
  selector: 'app-settings-panel',
  template: `
    <h1>Settings Panel</h1>
    <mat-accordion>
      <!-- Cleaning Rules -->
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Cleaning Rules</mat-panel-title>
        </mat-expansion-panel-header>

        <div class="rule-option">
          <mat-checkbox [(ngModel)]="settings.autoCorrectAuthors">
            Auto-correct Author Names
          </mat-checkbox>
        </div>

        <div class="rule-option">
          <mat-checkbox [(ngModel)]="settings.validateCoordinates">
            Validate Coordinates
          </mat-checkbox>
        </div>

        <div class="rule-option">
          <mat-checkbox [(ngModel)]="settings.resolveTaxonomy">
            Resolve Taxonomic Hierarchy
          </mat-checkbox>
        </div>
      </mat-expansion-panel>

      <!-- Data Sources -->
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Data Sources</mat-panel-title>
        </mat-expansion-panel-header>

        <div class="source-option" *ngFor="let source of availableSources">
          <mat-checkbox [(ngModel)]="source.enabled">
            {{ source.name }}
          </mat-checkbox>
        </div>
      </mat-expansion-panel>

      <!-- Advanced Settings -->
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>Advanced</mat-panel-title>
        </mat-expansion-panel-header>

        <mat-form-field>
          <mat-label>Chunk Size</mat-label>
          <input matInput type="number" [(ngModel)]="settings.chunkSize" />
          <!-- Add matInput -->
        </mat-form-field>

        <mat-form-field>
          <mat-label>Confidence Threshold</mat-label>
          <input
            matInput
            type="number"
            [(ngModel)]="settings.confidenceThreshold"
          />
          <!-- Add matInput -->
        </mat-form-field>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  standalone: false,
})
export class SettingsPanelComponent {
  settings: CleaningSettings = {
    autoCorrectAuthors: true,
    validateCoordinates: true,
    resolveTaxonomy: true,
    chunkSize: 50,
    confidenceThreshold: 0.8,
    sources: [],
    currentSource: 'symbiota2',
  };

  availableSources: DataSourceConfig[] = [
    {
      name: 'Symbiota2 Collections',
      enabled: true,
      endpoint: '/api/collections',
    },
    { name: 'GBIF Backbone Taxonomy', enabled: false },
    { name: 'IPNI Authors', enabled: true },
  ];

  @Output() settingsChanged = new EventEmitter<CleaningSettings>();

  ngOnInit() {
    this.settingsChanged.emit(this.settings);
  }

  ngOnChanges() {
    this.updateSources();
    this.settingsChanged.emit(this.settings);
  }

  updateSources() {
    this.settings.sources = this.availableSources
      .filter((s) => s.enabled)
      .map((s) => s.name.toLowerCase().replace(/\s+/g, '-'));
  }
}
