// apps/ui/src/app/core/services/cleaning.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'apps/ui/src/environments/environment';
import {
  CleaningResult,
  CleaningSettings,
  CreateJobResponse,
  CreateJobResponseDto,
  JobProgress,
  TaxonRecord,
} from '../models/data.models';

@Injectable({ providedIn: 'root' })
export class CleaningService {
  private apiUrl = environment.apiUrl;
  private currentJobId: string | null = null;

  constructor(private http: HttpClient) {}

  startCleaningSession(data: TaxonRecord[], settings: CleaningSettings) {
    return this.http
      .post<CreateJobResponseDto>(`${this.apiUrl}/jobs`, {
        data,
        settings,
      })
      .pipe(tap((response) => (this.currentJobId = response.jobId)));
  }

  getChunk(chunkIndex: number): Observable<CleaningResult[]> {
    return this.http.get<CleaningResult[]>(
      `${this.apiUrl}/jobs/${this.currentJobId}/chunks/${chunkIndex}`
    );
  }

  approveChunk(chunkIndex: number, corrections: CleaningResult[]) {
    return this.http.patch<void>(
      `${this.apiUrl}/jobs/${this.currentJobId}/chunks/${chunkIndex}`,
      corrections
    );
  }

  finalizeJob(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/jobs/${this.currentJobId}/finalize`,
      {}
    );
  }

  exportResults(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/jobs/${this.currentJobId}/export`, {
      responseType: 'blob',
    });
  }

  getJobProgress(jobId: string): Observable<JobProgress> {
    return this.http.get<JobProgress>(`${this.apiUrl}/jobs/${jobId}/progress`);
  }
}
