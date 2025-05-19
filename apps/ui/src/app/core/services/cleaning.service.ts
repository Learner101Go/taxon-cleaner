// // apps/ui/src/app/core/services/cleaning.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { delayWhen, map, Observable, retryWhen, take, tap, timer } from 'rxjs';
// import { environment } from 'apps/ui/src/environments/environment';
// import {
//   CleaningResult,
//   CleaningSettings,
//   CreateJobResponse,
//   CreateJobResponseDto,
//   JobProgress,
//   TaxonRecord,
// } from '../models/data.models';

// @Injectable({ providedIn: 'root' })
// export class CleaningService {
//   private apiUrl = environment.apiUrl;
//   private currentJobId: string | null = null;

//   constructor(private http: HttpClient) {}

//   startCleaningSession(data: TaxonRecord[], settings: CleaningSettings) {
//     return this.http
//       .post<CreateJobResponseDto>(`${this.apiUrl}/jobs`, {
//         data,
//         settings,
//       })
//       .pipe(tap((response) => (this.currentJobId = response.jobId)));
//   }

//   // getChunk(chunkIndex: number): Observable<CleaningResult[]> {
//   //   return this.http.get<CleaningResult[]>(
//   //     `${this.apiUrl}/jobs/${this.currentJobId}/chunks/${chunkIndex}`
//   //   );
//   // }

//   getChunk(jobId: string, index: number): Observable<CleaningResult[]> {
//     return this.http
//       .get<CleaningResult[]>(`${this.apiUrl}/jobs/${jobId}/chunks/${index}`)
//       .pipe(
//         retryWhen((errors) =>
//           errors.pipe(
//             delayWhen(() => timer(1000)),
//             take(5)
//           )
//         )
//       );
//   }

//   approveChunk(chunkIndex: number, corrections: CleaningResult[]) {
//     return this.http.patch<void>(
//       `${this.apiUrl}/jobs/${this.currentJobId}/chunks/${chunkIndex}`,
//       corrections
//     );
//   }

//   finalizeJob(): Observable<void> {
//     return this.http.post<void>(
//       `${this.apiUrl}/jobs/${this.currentJobId}/finalize`,
//       {}
//     );
//   }

//   exportResults(): Observable<Blob> {
//     return this.http.get(`${this.apiUrl}/jobs/${this.currentJobId}/export`, {
//       responseType: 'blob',
//     });
//   }

//   getJobProgress(jobId: string): Observable<JobProgress> {
//     return this.http.get<JobProgress>(`${this.apiUrl}/jobs/${jobId}/progress`);
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TaxonRecord,
  CleaningSettings,
  CreateJobResponseDto,
  CleaningResult,
  JobProgress,
} from '../models/data.models';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
