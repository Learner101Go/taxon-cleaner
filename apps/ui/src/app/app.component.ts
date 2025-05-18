import { Component } from '@angular/core';
import { CleaningSettings, DataLoadEvent } from './core/models/data.models';
import { CleaningService } from './core/services/cleaning.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  results: any;
  completed = false;

  settings: CleaningSettings = {
    autoCorrectAuthors: true,
    validateCoordinates: true,
    resolveTaxonomy: true,
    chunkSize: 50,
    confidenceThreshold: 0.8,
    currentSource: 'symbiota2',
    inputMethod: ['file-upload', 'text-input'], // 🚩 allow both sources
  };

  constructor(private cleaningService: CleaningService) {}

  onSettings(settings: CleaningSettings) {
    this.settings = { ...this.settings, ...settings };
  }

  onDataLoaded(event: DataLoadEvent) {
    console.log('onDataLoaded called');
    if (this.settings.inputMethod?.includes(event.source)) {
      this.cleaningService
        .startCleaningSession(event.data, this.settings)
        .subscribe((response) => {
          console.log(
            '🚀 StartCleaningSession subscribed >>> Received response:',
            response
          );
          this.results = response; // triggers <app-chunk-processor>
          this.completed = false;
        });
    }
  }
}
