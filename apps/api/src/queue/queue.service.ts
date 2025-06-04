import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue, Job, JobsOptions } from 'bullmq';
import { JobData, JobProgress, JobStatus } from '../shared/types';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('cleaning') private readonly queue: Queue<JobData>
  ) {}

  async addJob(jobData: JobData, opts?: JobsOptions): Promise<Job<JobData>> {
    // Use a unique name that includes chunk info
    const jobName = `cleaning_chunk_${jobData.chunkIndex}_${Date.now()}`;

    try {
      return await this.queue.add(jobName, jobData, opts);
    } catch (error) {
      console.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  /** Look up a single job by ID */
  async getJob(jobId: string): Promise<Job<JobData> | undefined> {
    return this.queue.getJob(jobId);
  }

  /** Find a job by group ID and chunk index */
  async findJobByGroupAndChunk(
    jobGroupId: string,
    chunkIndex: number
  ): Promise<Job<JobData> | null> {
    const jobs = await this.queue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
    ]);

    const targetJob = jobs.find(
      (job) =>
        job.data.jobGroupId === jobGroupId && job.data.chunkIndex === chunkIndex
    );

    return targetJob || null;
  }

  /** Get all jobs for a specific group */
  async getJobsByGroup(jobGroupId: string): Promise<Job<JobData>[]> {
    const jobs = await this.queue.getJobs([
      'completed',
      'waiting',
      'active',
      'delayed',
    ]);

    return jobs.filter((job) => job.data.jobGroupId === jobGroupId);
  }

  getQueueQualifiedName(): string {
    return this.queue.name;
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    const job = await this.getJob(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);

    const jobGroupId = job.data.jobGroupId;
    if (!jobGroupId) {
      // …single-job case unchanged…
    }

    const groupJobs = await this.getJobsByGroup(jobGroupId);
    const totalChunks = job.data.totalChunks || groupJobs.length;

    // Prepare an array of null slots
    const chunks: (any[] | null)[] = Array(totalChunks).fill(null);
    let currentChunk = 0;

    for (const groupJob of groupJobs) {
      const idx = groupJob.data.chunkIndex;
      if (idx === undefined) continue;

      // 1) pull the PATCHed corrections out of progress, if any
      const prog = (await groupJob.progress) as any;
      const corrected: any[] | undefined = prog?.corrections;

      // 2) if user never PATCHed, fall back to the auto-processed returnvalue
      chunks[idx] = corrected ?? groupJob.returnvalue;

      // 3) advance the cursor if this job finished
      if (groupJob.finishedOn) {
        currentChunk = Math.max(currentChunk, idx + 1);
      }
    }

    return { chunks, currentChunk, totalChunks };
  }

  /** Remove ALL jobs (waiting, active, completed, failed) on this queue */
  async flush() {
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
