import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CleaningResult,
  CreateSessionResponseDto,
  SessionData,
  SessionProgress,
  TaxonRecord,
  DataSettings,
  JobData,
} from '../shared/types';
import { chunkArray } from '../shared/types';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class JobsService {
  private sessions = new Map<string, SessionData>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CONCURRENT_CHUNKS = 3; // Process max 3 chunks ahead

  constructor(private readonly queueService: QueueService) {
    // Clean up old sessions periodically
    setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000); // Every hour
  }

  async createSession(
    records: TaxonRecord[],
    settings: DataSettings
  ): Promise<CreateSessionResponseDto> {
    const sessionId = this.generateSessionId();
    const chunks = chunkArray(records, settings.chunkSize);

    const sessionData: SessionData = {
      sessionId,
      records,
      settings,
      totalChunks: chunks.length,
      chunkSize: settings.chunkSize,
      processedChunks: new Map(),
      correctedChunks: new Map(),
      readyChunks: new Set(),
      currentlyProcessing: new Set(),
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    this.sessions.set(sessionId, sessionData);

    // Start processing first few chunks immediately
    this.startInitialChunkProcessing(sessionId);

    return {
      sessionId,
      totalChunks: chunks.length,
      totalRecords: records.length,
    };
  }

  private async startInitialChunkProcessing(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const chunksToProcess = Math.min(
      this.MAX_CONCURRENT_CHUNKS,
      session.totalChunks
    );

    for (let i = 0; i < chunksToProcess; i++) {
      this.processChunk(sessionId, i);
    }
  }

  private async processChunk(
    sessionId: string,
    chunkIndex: number
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.currentlyProcessing.has(chunkIndex)) {
      return;
    }

    session.currentlyProcessing.add(chunkIndex);
    session.lastAccessed = new Date();

    try {
      const startIdx = chunkIndex * session.chunkSize;
      const endIdx = Math.min(
        startIdx + session.chunkSize,
        session.records.length
      );
      const chunkRecords = session.records.slice(startIdx, endIdx);

      const jobData: JobData = {
        sessionId,
        chunkIndex,
        records: chunkRecords,
        settings: session.settings,
        totalChunks: session.totalChunks,
      };

      console.log(`Processing chunk ${chunkIndex} for session ${sessionId}`);

      // Add to queue for processing
      const job = await this.queueService.addJob(jobData);

      // Wait for job completion and store results
      const results = await this.waitForJobCompletion(job.id);

      session.processedChunks.set(chunkIndex, results);
      session.readyChunks.add(chunkIndex);
      session.currentlyProcessing.delete(chunkIndex);

      console.log(`Chunk ${chunkIndex} completed for session ${sessionId}`);

      // Process next chunk if needed
      this.processNextChunkIfNeeded(sessionId, chunkIndex);
    } catch (error) {
      console.error(`Error processing chunk ${chunkIndex}:`, error);
      session.currentlyProcessing.delete(chunkIndex);
    }
  }

  private async waitForJobCompletion(jobId: string): Promise<CleaningResult[]> {
    return new Promise((resolve, reject) => {
      const checkJob = async () => {
        try {
          const job = await this.queueService.getJob(jobId);
          if (!job) {
            reject(new Error('Job not found'));
            return;
          }

          if (job.finishedOn && job.returnvalue) {
            resolve(job.returnvalue);
          } else if (job.failedReason) {
            reject(new Error(job.failedReason));
          } else {
            // Job still processing, check again in 1 second
            setTimeout(checkJob, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkJob();
    });
  }

  private processNextChunkIfNeeded(
    sessionId: string,
    completedChunkIndex: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Find the next chunk that should be processed
    const maxProcessAhead = completedChunkIndex + this.MAX_CONCURRENT_CHUNKS;
    const nextChunkToProcess =
      session.readyChunks.size + session.currentlyProcessing.size;

    if (
      nextChunkToProcess < session.totalChunks &&
      nextChunkToProcess <= maxProcessAhead
    ) {
      this.processChunk(sessionId, nextChunkToProcess);
    }
  }

  async getSessionProgress(sessionId: string): Promise<SessionProgress> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.lastAccessed = new Date();

    return {
      sessionId,
      totalChunks: session.totalChunks,
      readyChunks: Array.from(session.readyChunks).sort((a, b) => a - b),
      currentlyProcessing: Array.from(session.currentlyProcessing).sort(
        (a, b) => a - b
      ),
      correctedChunks: Array.from(session.correctedChunks.keys()).sort(
        (a, b) => a - b
      ),
      totalRecords: session.records.length,
    };
  }

  async getChunk(
    sessionId: string,
    chunkIndex: number
  ): Promise<CleaningResult[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.lastAccessed = new Date();

    // Return corrected version if available, otherwise processed version
    if (session.correctedChunks.has(chunkIndex)) {
      return session.correctedChunks.get(chunkIndex)!;
    }

    if (session.processedChunks.has(chunkIndex)) {
      return session.processedChunks.get(chunkIndex)!;
    }

    // If chunk is not ready but not currently processing, start processing
    if (!session.currentlyProcessing.has(chunkIndex)) {
      this.processChunk(sessionId, chunkIndex);
    }

    throw new BadRequestException(`Chunk ${chunkIndex} not ready yet`);
  }

  async saveChunkCorrections(
    sessionId: string,
    chunkIndex: number,
    corrections: CleaningResult[]
  ): Promise<{ success: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.lastAccessed = new Date();
    session.correctedChunks.set(chunkIndex, corrections);

    console.log(
      `Saved corrections for chunk ${chunkIndex} in session ${sessionId}`
    );

    // Process next chunk if needed
    this.processNextChunkIfNeeded(sessionId, chunkIndex);

    return { success: true };
  }

  async getAllResults(sessionId: string): Promise<CleaningResult[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.lastAccessed = new Date();

    const allResults: CleaningResult[] = [];

    for (let i = 0; i < session.totalChunks; i++) {
      const corrected = session.correctedChunks.get(i);
      const processed = session.processedChunks.get(i);

      if (corrected) {
        allResults.push(...corrected);
      } else if (processed) {
        allResults.push(...processed);
      }
    }

    return allResults;
  }

  async flushAllSessions(): Promise<{ status: string; cleared: number }> {
    const sessionCount = this.sessions.size;
    this.sessions.clear();
    await this.queueService.flush();

    return {
      status: 'flushed',
      cleared: sessionCount,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldSessions(): void {
    const now = new Date();
    const sessionsToDelete: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastAccess =
        now.getTime() - session.lastAccessed.getTime();
      if (timeSinceLastAccess > this.SESSION_TIMEOUT) {
        sessionsToDelete.push(sessionId);
      }
    }

    sessionsToDelete.forEach((sessionId) => {
      this.sessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    });

    if (sessionsToDelete.length > 0) {
      console.log(`Cleaned up ${sessionsToDelete.length} old sessions`);
    }
  }
}
