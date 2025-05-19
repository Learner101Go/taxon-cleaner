// src/queue/queue.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { JobState } from '../jobs/enums/job-state';
import {
  DataSettings,
  JobData,
  JobProgress,
  TaxonRecord,
} from '../shared/types';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('cleaning') private readonly queue: Queue<JobData>
  ) {}

  async addJob(jobData: JobData) {
    // jobData now includes chunkIndex and totalChunks
    return this.queue.add('cleaning', jobData);
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    const job = await this.queue.getJob(jobId);
    return job.progress as JobProgress;
  }

  async getJob(jobId: string): Promise<Job<JobData> | undefined> {
    return this.queue.getJob(jobId);
  }

  async updateJobProgress(jobId: string, progress: number | object) {
    const job = await this.getJob(jobId);
    if (job) {
      await job.updateProgress(progress as any);
    }
  }

  async updateJobState(jobId: string, state: JobState) {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.updateProgress({ ...job.data, state });
    }
  }

  async flush() {
    await this.queue.obliterate({ force: true });
  }
}
