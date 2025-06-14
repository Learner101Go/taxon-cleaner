// // apps/api/src/jobs/jobs.service.ts
// import {
//   BadRequestException,
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { Job, Queue } from 'bullmq';
// import {
//   CleaningResult,
//   CreateJobResponseDto,
//   DataSettings,
//   JobData,
//   JobProgress,
//   TaxonRecord,
// } from '../shared/types';
// import { chunkArray } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Injectable()
// export class JobsService {
//   totalChunks: number;

//   constructor(private readonly queueService: QueueService) {}

//   async createJob(jobData: JobData): Promise<CreateJobResponseDto> {
//     const chunkSize = jobData.chunkSize || 50;
//     const chunks = chunkArray(jobData.records, chunkSize);
//     const totalChunks = chunks.length;

//     const job = await this.queueService.addJob({
//       ...jobData,
//       chunks,
//       totalChunks,
//       processedChunks: 0,
//     });

//     // Initialize progress structure with empty arrays
//     await job.updateProgress({
//       chunks: Array(totalChunks).fill([]),
//       currentChunk: 0,
//       totalChunks,
//     } as JobProgress);

//     return { jobId: job.id, totalChunks };
//   }

//   async safeGetJob(jobId: string): Promise<Job<JobData>> {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);
//     if (job.failedReason) throw new BadRequestException(job.failedReason);
//     return job;
//   }

//   async getChunkResults(
//     jobId: string,
//     chunkIndex: number
//   ): Promise<CleaningResult[]> {
//     const job = await this.safeGetJob(jobId);
//     console.log('job in backend: ', job);
//     const progress = (await job.progress) as JobProgress;
//     console.log('progress: in backend: ', progress);
//     if (!progress?.chunks?.[chunkIndex]) {
//       throw new NotFoundException(`Chunk ${chunkIndex} not processed yet`);
//     }

//     return progress.chunks[chunkIndex];
//   }

//   async saveChunkCorrections(
//     jobId: string,
//     chunkIndex: number,
//     corrections: CleaningResult[]
//   ) {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);

//     const progress = (await job.progress) as JobProgress;
//     progress.chunks[chunkIndex] = corrections;
//     progress.currentChunk = chunkIndex + 1;

//     await job.updateProgress(progress);
//     return { success: true };
//   }
// }

// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { FlowProducer, Job } from 'bullmq';
// import {
//   CleaningResult,
//   CreateJobResponseDto,
//   JobData,
//   JobProgress,
// } from '../shared/types';
// import { chunkArray } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Injectable()
// export class JobsService {
//   constructor(
//     private readonly queueService: QueueService,
//     private readonly flowProducer: FlowProducer
//   ) {}

//   /**
//    * Split jobData.records into chunks, enqueue one job per chunk,
//    * initialize progress, and return all job IDs.
//    */
//   async createJob(jobData: JobData): Promise<CreateJobResponseDto> {
//     const chunks = chunkArray(jobData.records, jobData.chunkSize);
//     const totalChunks = chunks.length;

//     // Build a flow: one parent + N children, all on the 'cleaning' queue
//     const flow = await this.flowProducer.add({
//       name: 'parent-cleaning',
//       queueName: 'cleaning',
//       data: { ...jobData, isParent: true, totalChunks },
//       children: chunks.map((chunk, idx) => ({
//         name: `chunk-${idx}`,
//         queueName: 'cleaning',
//         data: {
//           ...jobData,
//           records: chunk,
//           chunkIndex: idx,
//           totalChunks,
//         },
//       })),
//     });

//     // flow.job is the parent Job instance
//     const parentJobId = flow.job.id.toString();
//     return { jobIds: [parentJobId], totalChunks };
//   }

//   private async getJobOrThrow(jobId: string): Promise<Job> {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);
//     if (job.failedReason) throw new BadRequestException(job.failedReason);
//     return job;
//   }

//   /** Read one chunk’s results from progress.chunks */
//   async getChunkResults(
//     jobId: string,
//     chunkIndex: number
//   ): Promise<CleaningResult[]> {
//     const job = await this.getJobOrThrow(jobId);
//     const prog = (await job.progress) as JobProgress;
//     const arr = prog.chunks;
//     if (!Array.isArray(arr) || arr[chunkIndex] == null) {
//       throw new NotFoundException(`Chunk ${chunkIndex} not ready`);
//     }
//     return arr[chunkIndex];
//   }

//   /** Save the user’s approved corrections into the correct slot */
//   async saveChunkCorrections(
//     jobId: string,
//     chunkIndex: number,
//     corrections: CleaningResult[]
//   ) {
//     const job = await this.getJobOrThrow(jobId);
//     const prog = (await job.progress) as JobProgress;
//     prog.chunks[chunkIndex] = corrections;
//     prog.currentChunk = chunkIndex + 1;
//     await job.updateProgress(prog);
//     return { success: true };
//   }

//   async safeGetJob(jobId: string): Promise<Job<JobData>> {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);
//     if (job.failedReason) throw new BadRequestException(job.failedReason);
//     return job;
//   }

//   /** Exposed so controller’s flushQueue can call it */
//   async flushAllJobs() {
//     await this.queueService.flush();
//     return { status: 'flushed' };
//   }
// }

//////////////////////////////////////////////////////

// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { Job } from 'bullmq';
// import {
//   CleaningResult,
//   CreateJobResponseDto,
//   JobData,
//   JobProgress,
//   JobStatus,
// } from '../shared/types';
// import { chunkArray } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Injectable()
// export class JobsService {
//   constructor(private readonly queueService: QueueService) {}

//   async createJob(jobData: JobData): Promise<CreateJobResponseDto> {
//     const chunks = chunkArray(jobData.records, jobData.chunkSize);

//     // Generate a unique job group ID
//     const jobGroupId = `group_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     // Create individual jobs for each chunk (no parent-child relationship)
//     const jobs = await Promise.all(
//       chunks.map((chunk, index) =>
//         this.queueService.addJob({
//           ...jobData,
//           records: chunk,
//           chunkIndex: index,
//           totalChunks: chunks.length,
//           jobGroupId, // Use this to group related jobs
//         })
//       )
//     );

//     const jobIds = jobs.map((job) => job.id);

//     return {
//       jobIds,
//       totalChunks: chunks.length,
//     };
//   }

//   private async getJobOrThrow(jobId: string): Promise<Job> {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);
//     if (job.failedReason) throw new BadRequestException(job.failedReason);
//     return job;
//   }

//   /** Read one chunk's results from the first job ID (treating it as the main job) */
//   async getChunkResults(
//     jobId: string,
//     chunkIndex: number
//   ): Promise<CleaningResult[]> {
//     // For this approach, we'll look for jobs with the same jobGroupId
//     const job = await this.getJobOrThrow(jobId);
//     const jobGroupId = job.data.jobGroupId;

//     if (!jobGroupId) {
//       throw new NotFoundException(`Job group not found for job ${jobId}`);
//     }

//     // Find the specific chunk job
//     const chunkJob = await this.queueService.findJobByGroupAndChunk(
//       jobGroupId,
//       chunkIndex
//     );

//     if (!chunkJob || !chunkJob.returnvalue) {
//       throw new NotFoundException(`Chunk ${chunkIndex} not ready`);
//     }

//     return chunkJob.returnvalue;
//   }

//   /** Save the user's approved corrections into the correct chunk job */
//   async saveChunkCorrections(
//     jobId: string,
//     chunkIndex: number,
//     corrections: CleaningResult[]
//   ) {
//     const job = await this.getJobOrThrow(jobId);
//     const jobGroupId = job.data.jobGroupId;

//     if (!jobGroupId) {
//       throw new NotFoundException(`Job group not found for job ${jobId}`);
//     }

//     // Find the specific chunk job and update its progress
//     const chunkJob = await this.queueService.findJobByGroupAndChunk(
//       jobGroupId,
//       chunkIndex
//     );

//     if (!chunkJob) {
//       throw new NotFoundException(`Chunk job ${chunkIndex} not found`);
//     }

//     // Store corrections in job progress
//     await chunkJob.updateProgress({ corrections, approved: true });

//     return { success: true };
//   }

//   async safeGetJob(jobId: string): Promise<Job<JobData>> {
//     const job = await this.queueService.getJob(jobId);
//     if (!job) throw new NotFoundException(`Job ${jobId} not found`);
//     if (job.failedReason) throw new BadRequestException(job.failedReason);
//     return job;
//   }

//   /** Exposed so controller's flushQueue can call it */
//   async flushAllJobs() {
//     await this.queueService.flush();
//     return { status: 'flushed' };
//   }
// }

///////////////////////////////////////////////////////////////////

// src/jobs/jobs.service.ts (Streamlined)
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CleaningResult,
  CreateSessionResponse,
  SessionData,
  JobData,
  TaxonRecord,
  DataSettings,
} from '../shared/types';
import { chunkArray } from '../shared/types';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class JobsService {
  private readonly sessions = new Map<string, SessionData>();

  constructor(private readonly queueService: QueueService) {}

  async createSession(
    data: TaxonRecord[],
    settings: DataSettings
  ): Promise<CreateSessionResponse> {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const chunks = chunkArray(data, settings.chunkSize);

    // Store session metadata
    const sessionData: SessionData = {
      sessionId,
      totalRecords: data.length,
      totalChunks: chunks.length,
      chunkSize: settings.chunkSize,
      processedChunks: 0,
      settings,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, sessionData);

    // Create jobs for first batch (e.g., first 10 chunks)
    const initialBatchSize = Math.min(10, chunks.length);
    const initialJobs = chunks
      .slice(0, initialBatchSize)
      .map((chunk, index) => ({
        sessionId,
        chunkIndex: index,
        totalChunks: chunks.length,
        records: chunk,
        settings,
      }));

    // Add initial batch to queue
    await Promise.all(
      initialJobs.map((jobData) => this.queueService.addJob(jobData))
    );

    // Store remaining chunks for later processing
    if (chunks.length > initialBatchSize) {
      sessionData['remainingChunks'] = chunks.slice(initialBatchSize);
      this.sessions.set(sessionId, sessionData);
    }

    console.log(
      `Session ${sessionId} created with ${chunks.length} total chunks, ${initialBatchSize} initially queued`
    );

    return {
      sessionId,
      totalChunks: chunks.length,
      totalRecords: data.length,
    };
  }

  async processNextBatch(
    sessionId: string,
    currentChunk: number
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session['remainingChunks']) return;

    const remainingChunks = session['remainingChunks'] as TaxonRecord[][];
    const batchSize = 5; // Process 5 chunks ahead
    const startIndex = currentChunk + 1;
    const endIndex = Math.min(startIndex + batchSize, session.totalChunks);

    const jobsToCreate = [];
    for (let i = startIndex; i < endIndex; i++) {
      const chunkIndex = i;
      const chunkData = remainingChunks[i - 10]; // Adjust index for remaining chunks

      if (chunkData) {
        jobsToCreate.push({
          sessionId,
          chunkIndex,
          totalChunks: session.totalChunks,
          records: chunkData,
          settings: session.settings,
        });
      }
    }

    // Add jobs to queue
    await Promise.all(
      jobsToCreate.map((jobData) => this.queueService.addJob(jobData))
    );

    console.log(
      `Queued ${jobsToCreate.length} additional chunks for session ${sessionId}`
    );
  }

  async getSessionProgress(sessionId: string) {
    return this.queueService.getSessionProgress(sessionId);
  }

  async getChunk(
    sessionId: string,
    chunkIndex: number
  ): Promise<CleaningResult[]> {
    return this.queueService.getChunk(sessionId, chunkIndex);
  }

  async approveChunk(
    sessionId: string,
    chunkIndex: number,
    corrections: CleaningResult[]
  ) {
    await this.queueService.approveChunk(sessionId, chunkIndex, corrections);

    // Trigger processing of next batch if needed
    await this.processNextBatch(sessionId, chunkIndex);

    return { success: true };
  }

  async getAllResults(sessionId: string): Promise<CleaningResult[]> {
    const chunks = await this.queueService.getAllSessionChunks(sessionId);
    return chunks
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .flatMap((chunk) => chunk.corrections || chunk.results);
  }

  async cleanupSession(sessionId: string) {
    this.sessions.delete(sessionId);
    await this.queueService.cleanupSession(sessionId);
  }

  async flushAllSessions() {
    this.sessions.clear();
    await this.queueService.flush();
    return { status: 'flushed' };
  }
}
