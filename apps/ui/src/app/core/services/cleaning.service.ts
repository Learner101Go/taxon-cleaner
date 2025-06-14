// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import {
//   TaxonRecord,
//   CleaningSettings,
//   CreateJobResponseDto,
//   CleaningResult,
//   JobProgress,
// } from '../models/data.models';
// import { Observable } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class CleaningService {
//   private apiUrl = environment.apiUrl;
//   private currentJobIds: string[] = [];

//   constructor(private http: HttpClient) {}

//   startCleaningSession(
//     data: TaxonRecord[],
//     settings: CleaningSettings
//   ): Observable<CreateJobResponseDto> {
//     console.log('Starting cleaning session with', data.length, 'records');
//     return this.http
//       .post<CreateJobResponseDto>(`${this.apiUrl}/jobs`, {
//         data,
//         settings,
//       })
//       .pipe(
//         tap((response) => {
//           this.currentJobIds = response.jobIds;
//           console.log('Cleaning session started, job IDs:', response.jobIds);
//         }),
//         catchError((error) => {
//           console.error('Error starting cleaning session:', error);
//           return throwError(() => error);
//         })
//       );
//   }

//   getChunk(jobId: string, chunkIndex: number): Observable<CleaningResult[]> {
//     console.log(`Fetching chunk ${chunkIndex} from job ${jobId}`);
//     return this.http
//       .get<CleaningResult[]>(
//         `${this.apiUrl}/jobs/${jobId}/chunks/${chunkIndex}`
//       )
//       .pipe(
//         tap((chunk) => {
//           console.log(
//             `Received chunk ${chunkIndex} with ${chunk.length} records`
//           );
//         }),
//         catchError((error) => {
//           console.error(`Error fetching chunk ${chunkIndex}:`, error);
//           return throwError(() => error);
//         })
//       );
//   }

//   approveChunk(
//     jobId: string,
//     chunkIndex: number,
//     corrections: CleaningResult[]
//   ): Observable<any> {
//     console.log(
//       `Approving chunk ${chunkIndex} with ${corrections.length} corrections`
//     );
//     return this.http
//       .patch<void>(
//         `${this.apiUrl}/jobs/${jobId}/chunks/${chunkIndex}`,
//         corrections
//       )
//       .pipe(
//         tap(() => {
//           console.log(`Chunk ${chunkIndex} approved successfully`);
//         }),
//         catchError((error) => {
//           console.error(`Error approving chunk ${chunkIndex}:`, error);
//           return throwError(() => error);
//         })
//       );
//   }

//   getJobProgress(jobId: string): Observable<JobProgress> {
//     return this.http
//       .get<JobProgress>(`${this.apiUrl}/jobs/${jobId}/progress`)
//       .pipe(
//         tap((progress) => {
//           console.log(`Job ${jobId} progress:`, {
//             currentChunk: progress.currentChunk,
//             totalChunks: progress.totalChunks,
//             completedChunks: progress.chunks.filter((c) => c !== null).length,
//           });
//         }),
//         catchError((error) => {
//           console.error(`Error getting progress for job ${jobId}:`, error);
//           return throwError(() => error);
//         })
//       );
//   }

//   // Helper method to get current job IDs
//   getCurrentJobIds(): string[] {
//     return this.currentJobIds;
//   }

//   // Utility method to flush all jobs (for development/testing)
//   flushJobs(): Observable<any> {
//     return this.http.post(`${this.apiUrl}/jobs/flush`, {}).pipe(
//       tap(() => {
//         console.log('All jobs flushed');
//         this.currentJobIds = [];
//       })
//     );
//   }
// }

/////////////////////////////////////////

// apps/ui/src/app/core/services/cleaning.service.ts (Updated)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TaxonRecord,
  CleaningSettings,
  CreateSessionResponse,
  CleaningResult,
  SessionProgress,
} from '../models/data.models';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CleaningService {
  private apiUrl = environment.apiUrl;
  private currentSessionId: string | null = null;

  constructor(private http: HttpClient) {}

  startCleaningSession(
    data: TaxonRecord[],
    settings: CleaningSettings
  ): Observable<CreateSessionResponse> {
    console.log('Starting cleaning session with', data.length, 'records');
    return this.http
      .post<CreateSessionResponse>(`${this.apiUrl}/sessions`, {
        data,
        settings,
      })
      .pipe(
        tap((response) => {
          this.currentSessionId = response.sessionId;
          console.log('Cleaning session started:', response.sessionId);
        }),
        catchError((error) => {
          console.error('Error starting cleaning session:', error);
          return throwError(() => error);
        })
      );
  }

  getSessionProgress(sessionId: string): Observable<SessionProgress> {
    return this.http
      .get<SessionProgress>(`${this.apiUrl}/sessions/${sessionId}/progress`)
      .pipe(
        tap((progress) => {
          console.log(`Session ${sessionId} progress:`, {
            status: progress.status,
            processedChunks: progress.processedChunks,
            totalChunks: progress.totalChunks,
            readyChunks: progress.readyChunks.length,
          });
        }),
        catchError((error) => {
          console.error(`Error getting session progress:`, error);
          return throwError(() => error);
        })
      );
  }

  getChunk(
    sessionId: string,
    chunkIndex: number
  ): Observable<CleaningResult[]> {
    console.log(`Fetching chunk ${chunkIndex} from session ${sessionId}`);
    return this.http
      .get<CleaningResult[]>(
        `${this.apiUrl}/sessions/${sessionId}/chunks/${chunkIndex}`
      )
      .pipe(
        tap((chunk) => {
          console.log(
            `Received chunk ${chunkIndex} with ${chunk.length} records`
          );
        }),
        catchError((error) => {
          console.error(`Error fetching chunk ${chunkIndex}:`, error);
          return throwError(() => error);
        })
      );
  }

  approveChunk(
    sessionId: string,
    chunkIndex: number,
    corrections: CleaningResult[]
  ): Observable<any> {
    console.log(
      `Approving chunk ${chunkIndex} with ${corrections.length} corrections`
    );
    return this.http
      .patch<void>(
        `${this.apiUrl}/sessions/${sessionId}/chunks/${chunkIndex}`,
        corrections
      )
      .pipe(
        tap(() => {
          console.log(`Chunk ${chunkIndex} approved successfully`);
        }),
        catchError((error) => {
          console.error(`Error approving chunk ${chunkIndex}:`, error);
          return throwError(() => error);
        })
      );
  }

  getAllResults(sessionId: string): Observable<CleaningResult[]> {
    return this.http
      .get<CleaningResult[]>(`${this.apiUrl}/sessions/${sessionId}/results`)
      .pipe(
        catchError((error) => {
          console.error(`Error getting all results:`, error);
          return throwError(() => error);
        })
      );
  }

  cleanupSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`).pipe(
      tap(() => {
        console.log(`Session ${sessionId} cleaned up`);
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = null;
        }
      })
    );
  }

  flushSessions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/flush`, {}).pipe(
      tap(() => {
        console.log('All sessions flushed');
        this.currentSessionId = null;
      })
    );
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}
