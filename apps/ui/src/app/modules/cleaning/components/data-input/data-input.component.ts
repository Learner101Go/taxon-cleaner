// apps/ui/src/app/modules/cleaning/components/data-input/data-input.componnet.ts
import { Component, EventEmitter, Output } from '@angular/core';
import {
  DataLoadEvent,
  TaxonRecord,
} from 'apps/ui/src/app/core/models/data.models';

@Component({
  selector: 'app-data-input',
  template: `
    <div class="input-container">
      <!-- File Upload -->
      <input
        type="file"
        (change)="handleFileUpload($event)"
        hidden
        #fileInput
      />
      <button mat-raised-button (click)="fileInput.click()">Upload JSON</button>

      <div class="text-input">
        <textarea
          matInput
          rows="8"
          [(ngModel)]="rawData"
          placeholder="Paste JSON"
        ></textarea>

        <!-- Disable if rawData is empty -->
        <button mat-button (click)="processTextInput()" [disabled]="!rawData">
          Process Text
        </button>
      </div>

      <!-- Errors -->
      <app-error-alert [errors]="inputErrors"></app-error-alert>
    </div>
  `,
  standalone: false,
})
export class DataInputComponent {
  @Output() dataLoaded = new EventEmitter<DataLoadEvent>(); // fix later

  rawData = '';
  inputErrors: string[] = [];

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader(); // 🕮 FileReader API :contentReference[oaicite:4]{index=4}
    reader.onload = () => {
      try {
        const data: TaxonRecord[] = JSON.parse(reader.result as string);
        this.rawData = reader.result as string;
        this.dataLoaded.emit({ data, source: 'file-upload' });
        this.inputErrors = [];
      } catch {
        this.inputErrors = ['Invalid JSON file format'];
      }
    };
    reader.readAsText(file);
  }

  processTextInput() {
    // console.log('🔍 Raw JSON to parse:', this.rawData);
    if (!this.rawData?.trim()) return;

    try {
      // Improved JSON validation
      const data: TaxonRecord[] = JSON.parse(this.rawData);
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array');
      }

      this.dataLoaded.emit({ data, source: 'file-upload' });
      this.inputErrors = [];
    } catch (error) {
      this.inputErrors = [this.getErrorMessage(error)];
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof SyntaxError) {
      return 'Invalid JSON syntax - check for missing commas or quotes';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error parsing JSON';
  }
}
