import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CleaningSettings,
  CleanMode,
  DataSourceConfig,
} from 'apps/ui/src/app/core/models/data.models';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
  standalone: false,
})
export class SettingsPanelComponent {
  @Input() settings!: CleaningSettings;
  @Input() mode!: CleanMode;
  @Output() settingsChanged = new EventEmitter<CleaningSettings>();

  availableSources: DataSourceConfig[] = [
    {
      name: 'Symbiota2 Collections',
      enabled: false,
      endpoint: '/api/collections',
    },
    { name: 'GBIF Backbone Taxonomy', enabled: false },
    { name: 'IPNI Authors', enabled: true },
  ];

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

  onUserChange() {
    this.updateSources();
    this.settingsChanged.emit({ ...this.settings });
  }
}
