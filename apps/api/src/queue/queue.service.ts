// import { Injectable, NotFoundException } from '@nestjs/common';
// import { Queue, Job, JobsOptions } from 'bullmq';
// import { JobData, JobProgress, JobStatus } from '../shared/types';
// import { InjectQueue } from '@nestjs/bullmq';

// @Injectable()
// export class QueueService {
//   constructor(
//     @InjectQueue('cleaning') private readonly queue: Queue<JobData>
//   ) {}

//   async addJob(jobData: JobData, opts?: JobsOptions): Promise<Job<JobData>> {
//     // Use a unique name that includes chunk info
//     const jobName = `cleaning_chunk_${jobData.chunkIndex}_${Date.now()}`;

//     try {
//       return await this.queue.add(jobName, jobData, opts);
//     } catch (error) {
//       console.error('Failed to add job to queue:', error);
//       throw error;
//     }
//   }

//   /** Look up a single job by ID */
//   async getJob(jobId: string): Promise<Job<JobData> | undefined> {
//     return this.queue.getJob(jobId);
//   }

//   /** Find a job by group ID and chunk index */
//   async findJobByGroupAndChunk(
//     jobGroupId: string,
//     chunkIndex: number
//   ): Promise<Job<JobData> | null> {
//     const jobs = await this.queue.getJobs([
//       'completed',
//       'waiting',
//       'active',
//       'delayed',
//     ]);

//     const targetJob = jobs.find(
//       (job) =>
//         job.data.jobGroupId === jobGroupId && job.data.chunkIndex === chunkIndex
//     );

//     return targetJob || null;
//   }

//   /** Get all jobs for a specific group */
//   async getJobsByGroup(jobGroupId: string): Promise<Job<JobData>[]> {
//     const jobs = await this.queue.getJobs([
//       'completed',
//       'waiting',
//       'active',
//       'delayed',
//     ]);

//     return jobs.filter((job) => job.data.jobGroupId === jobGroupId);
//   }

//   getQueueQualifiedName(): string {
//     return this.queue.name;
//   }

//   async getJobProgress(jobId: string): Promise<JobProgress> {
//     const job = await this.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);

//     const jobGroupId = job.data.jobGroupId;
//     if (!jobGroupId) {
//       // …single-job case unchanged…
//     }

//     const groupJobs = await this.getJobsByGroup(jobGroupId);
//     const totalChunks = job.data.totalChunks || groupJobs.length;

//     // Prepare an array of null slots
//     const chunks: (any[] | null)[] = Array(totalChunks).fill(null);
//     let currentChunk = 0;

//     for (const groupJob of groupJobs) {
//       const idx = groupJob.data.chunkIndex;
//       if (idx === undefined) continue;

//       // 1) pull the PATCHed corrections out of progress, if any
//       const prog = (await groupJob.progress) as any;
//       const corrected: any[] | undefined = prog?.corrections;

//       // 2) if user never PATCHed, fall back to the auto-processed returnvalue
//       chunks[idx] = corrected ?? groupJob.returnvalue;

//       // 3) advance the cursor if this job finished
//       if (groupJob.finishedOn) {
//         currentChunk = Math.max(currentChunk, idx + 1);
//       }
//     }

//     return { chunks, currentChunk, totalChunks };
//   }

//   /** Remove ALL jobs (waiting, active, completed, failed) on this queue */
//   async flush() {
//     const jobs = await this.queue.getJobs([
//       'waiting',
//       'active',
//       'delayed',
//       'completed',
//       'failed',
//     ]);
//     await Promise.all(jobs.map((j) => j.remove()));
//   }
// }

//////////////////////////////////////////

// src/queue/queue.service.ts (Simplified)
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue, Job, JobsOptions } from 'bullmq';
import { JobData, SessionProgress, ChunkData } from '../shared/types';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  private readonly sessions = new Map<string, SessionProgress>();
  private readonly chunks = new Map<string, ChunkData>();

  constructor(
    @InjectQueue('cleaning') private readonly queue: Queue<JobData>
  ) {}

  private getChunkKey(sessionId: string, chunkIndex: number): string {
    return `${sessionId}:${chunkIndex}`;
  }

  async addJob(jobData: JobData, opts?: JobsOptions): Promise<Job<JobData>> {
    const jobName = `session_${jobData.sessionId}_chunk_${jobData.chunkIndex}`;

    try {
      const job = await this.queue.add(jobName, jobData, {
        ...opts,
        removeOnComplete: 10, // Keep only last 10 completed jobs
        removeOnFail: 5, // Keep only last 5 failed jobs
      });

      // Initialize session if not exists
      if (!this.sessions.has(jobData.sessionId)) {
        this.sessions.set(jobData.sessionId, {
          sessionId: jobData.sessionId,
          totalChunks: jobData.totalChunks,
          processedChunks: 0,
          readyChunks: [],
          currentChunk: 0,
          status: 'processing',
        });
      }

      return job;
    } catch (error) {
      console.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<Job<JobData> | undefined> {
    return this.queue.getJob(jobId);
  }

  async getSessionProgress(sessionId: string): Promise<SessionProgress> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    return session;
  }

  async markChunkReady(sessionId: string, chunkIndex: number, results: any[]) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Store chunk data
    const chunkKey = this.getChunkKey(sessionId, chunkIndex);
    this.chunks.set(chunkKey, {
      chunkIndex,
      results,
      approved: false,
    });

    // Update session progress
    if (!session.readyChunks.includes(chunkIndex)) {
      session.readyChunks.push(chunkIndex);
      session.readyChunks.sort((a, b) => a - b);
    }

    // Update status
    if (session.readyChunks.length === session.totalChunks) {
      session.status = 'ready';
    }

    this.sessions.set(sessionId, session);
  }

  async getChunk(sessionId: string, chunkIndex: number): Promise<any[]> {
    const chunkKey = this.getChunkKey(sessionId, chunkIndex);
    const chunk = this.chunks.get(chunkKey);

    if (!chunk) {
      throw new NotFoundException(
        `Chunk ${chunkIndex} not ready for session ${sessionId}`
      );
    }

    return chunk.corrections || chunk.results;
  }

  async approveChunk(
    sessionId: string,
    chunkIndex: number,
    corrections: any[]
  ) {
    const chunkKey = this.getChunkKey(sessionId, chunkIndex);
    const chunk = this.chunks.get(chunkKey);

    if (!chunk) {
      throw new NotFoundException(
        `Chunk ${chunkIndex} not found for session ${sessionId}`
      );
    }

    // Update chunk with corrections
    chunk.corrections = corrections;
    chunk.approved = true;
    this.chunks.set(chunkKey, chunk);

    // Update session progress
    const session = this.sessions.get(sessionId);
    if (session) {
      session.processedChunks = Array.from(this.chunks.values()).filter(
        (c) => c.approved && this.getSessionIdFromChunkKey(c) === sessionId
      ).length;

      if (session.processedChunks === session.totalChunks) {
        session.status = 'completed';
      }

      this.sessions.set(sessionId, session);
    }
  }

  private getSessionIdFromChunkKey(chunk: ChunkData): string {
    // Helper to extract session ID from chunk data
    const keys = Array.from(this.chunks.keys());
    const matchingKey = keys.find((key) => this.chunks.get(key) === chunk);
    return matchingKey ? matchingKey.split(':')[0] : '';
  }

  async getAllSessionChunks(sessionId: string): Promise<ChunkData[]> {
    const chunks: ChunkData[] = [];

    for (const [key, chunk] of this.chunks.entries()) {
      if (key.startsWith(`${sessionId}:`)) {
        chunks.push(chunk);
      }
    }

    return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  async cleanupSession(sessionId: string) {
    // Remove session data
    this.sessions.delete(sessionId);

    // Remove chunk data
    const keysToDelete = Array.from(this.chunks.keys()).filter((key) =>
      key.startsWith(`${sessionId}:`)
    );

    keysToDelete.forEach((key) => this.chunks.delete(key));
  }

  async flush() {
    // Clear all sessions and chunks
    this.sessions.clear();
    this.chunks.clear();

    // Remove all jobs from queue
    const jobs = await this.queue.getJobs([
      'waiting',
      'active',
      'delayed',
      'completed',
      'failed',
    ]);
    await Promise.all(jobs.map((j) => j.remove()));
  }
}
