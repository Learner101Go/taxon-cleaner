import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TaxonRecord,
  CleaningSettings,
  CreateSessionResponseDto,
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
  ): Observable<CreateSessionResponseDto> {
    console.log('Starting cleaning session with', data.length, 'records');
    return this.http
      .post<CreateSessionResponseDto>(`${this.apiUrl}/jobs`, {
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
      .get<SessionProgress>(`${this.apiUrl}/jobs/${sessionId}/progress`)
      .pipe(
        tap((progress) => {
          console.log(`Session ${sessionId} progress:`, {
            readyChunks: progress.readyChunks.length,
            totalChunks: progress.totalChunks,
            processing: progress.currentlyProcessing.length,
          });
        }),
        catchError((error) => {
          console.error(
            `Error getting progress for session ${sessionId}:`,
            error
          );
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
        `${this.apiUrl}/jobs/${sessionId}/chunks/${chunkIndex}`
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
        `${this.apiUrl}/jobs/${sessionId}/chunks/${chunkIndex}`,
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
      .get<CleaningResult[]>(`${this.apiUrl}/jobs/${sessionId}/results`)
      .pipe(
        tap((results) => {
          console.log(
            `Retrieved ${results.length} total results for session ${sessionId}`
          );
        }),
        catchError((error) => {
          console.error(
            `Error getting results for session ${sessionId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // getTestData() {
  //   return this.http.get(`${this.apiUrl}/jobs/test`);
  // }

  flushSessions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs/flush`, {}).pipe(
      tap(() => {
        console.log('All sessions flushed');
        this.currentSessionId = null;
      })
    );
  }
}
