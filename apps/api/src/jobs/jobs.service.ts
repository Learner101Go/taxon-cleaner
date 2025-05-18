// apps/api/src/jobs/jobs.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import {
  CleaningResult,
  CreateJobResponseDto,
  DataSettings,
  JobData,
  JobProgress,
  TaxonRecord,
} from '../shared/types';
import { chunkArray } from '../shared/types';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class JobsService {
  totalChunks: number;

  constructor(private readonly queueService: QueueService) {}

  async createJob(jobData: JobData): Promise<CreateJobResponseDto> {
    const chunkSize = jobData.chunkSize || 50;
    const chunks = chunkArray(jobData.records, chunkSize);
    const totalChunks = chunks.length;

    const job = await this.queueService.addJob({
      ...jobData,
      chunks,
      totalChunks,
      processedChunks: 0,
    });

    // Initialize progress structure
    await job.updateProgress({
      chunks: Array(totalChunks).fill(null),
      currentChunk: 0,
      totalChunks,
    } as JobProgress);

    return { jobId: job.id, totalChunks };
  }

  async safeGetJob(jobId: string): Promise<Job<JobData>> {
    const job = await this.queueService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    if (job.failedReason) throw new BadRequestException(job.failedReason);
    return job;
  }

  async getChunkResults(
    jobId: string,
    chunkIndex: number
  ): Promise<CleaningResult[]> {
    const job = await this.queueService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);

    const progress = (await job.progress) as JobProgress;
    if (!progress?.chunks?.[chunkIndex]) {
      throw new NotFoundException(`Chunk ${chunkIndex} not processed yet`);
    }

    return progress.chunks[chunkIndex];
  }

  async saveChunkCorrections(
    jobId: string,
    chunkIndex: number,
    corrections: CleaningResult[]
  ) {
    const job = await this.queueService.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);

    const progress = (await job.progress) as JobProgress;
    progress.chunks[chunkIndex] = corrections;
    progress.currentChunk = chunkIndex + 1;

    await job.updateProgress(progress);
    return { success: true };
  }
}
