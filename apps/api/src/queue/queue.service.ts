import { Injectable } from '@nestjs/common';
import { Queue, Job, JobsOptions } from 'bullmq';
import { JobData } from '../shared/types';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('cleaning') private readonly queue: Queue<JobData>
  ) {}

  async addJob(jobData: JobData, opts?: JobsOptions): Promise<Job<JobData>> {
    const jobName = `session_${jobData.sessionId}_chunk_${jobData.chunkIndex}`;

    const defaultOpts: JobsOptions = {
      removeOnComplete: 50, // Keep last 50 completed jobs
      removeOnFail: 20, // Keep last 20 failed jobs
      attempts: 2, // Retry failed jobs once
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };

    try {
      return await this.queue.add(jobName, jobData, {
        ...defaultOpts,
        ...opts,
      });
    } catch (error) {
      console.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<Job<JobData> | undefined> {
    return this.queue.getJob(jobId);
  }

  async flush(): Promise<void> {
    const jobs = await this.queue.getJobs([
      'waiting',
      'active',
      'delayed',
      'completed',
      'failed',
    ]);

    await Promise.all(jobs.map((j) => j.remove()));
    console.log(`Flushed ${jobs.length} jobs from queue`);
  }

  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}
