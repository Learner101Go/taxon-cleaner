// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';
import { ErrorAlertComponent } from './components/error-alert/error-alert.component';

@NgModule({
  declarations: [ProgressIndicatorComponent, ErrorAlertComponent],
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  exports: [
    MatIconModule,
    MatProgressBarModule,
    ProgressIndicatorComponent,
    ErrorAlertComponent,
  ],
})
export class SharedModule {}
