// src/app/modules/cleaning/cleaning.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from '../../shared/shared.module';
import { DataInputComponent } from './components/data-input/data-input.component';
import { ChunkProcessorComponent } from './components/chunk-processor/chunk-processor.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { ResultsReviewComponent } from './components/results-review/results-review.component';
import { CleaningDashboardComponent } from './pages/cleaning-dashboard/cleaning-dashboard.component';
import { CleaningRoutingModule } from './cleaning-routing.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    DataInputComponent,
    ChunkProcessorComponent,
    SettingsPanelComponent,
    ResultsReviewComponent,
    CleaningDashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSliderModule,
    CleaningRoutingModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    DataInputComponent,
    ChunkProcessorComponent,
    SettingsPanelComponent,
    ResultsReviewComponent,
    CleaningDashboardComponent,
    CleaningDashboardComponent,
  ],
})
export class CleaningModule {}
