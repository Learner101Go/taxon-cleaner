// apps/api/src/jobs/jobs.controller.ts
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import {
  CleaningResult,
  CreateJobResponseDto,
  DataSettings,
  JobData,
  TaxonRecord,
} from '../shared/types';
import { QueueService } from '../queue/queue.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private queueService: QueueService
  ) {}

  @Post()
  async create(
    @Body('data') data: TaxonRecord[],
    @Body('settings') settings: DataSettings
  ): Promise<CreateJobResponseDto> {
    const jobData: JobData = {
      records: data,
      source: settings.currentSource,
      chunkSize: settings.chunkSize,
    };

    return this.jobsService.createJob(jobData);
  }

  @Get(':id/chunks/:chunkIndex')
  async getChunk(
    @Param('id') jobId: string,
    @Param('chunkIndex') chunkIndex: number
  ) {
    return this.jobsService.getChunkResults(jobId, chunkIndex);
  }

  @Get(':id/progress')
  async getJobProgress(@Param('id') jobId: string) {
    const job = await this.jobsService.safeGetJob(jobId);
    return job.progress;
  }

  @Patch(':id/chunks/:chunkIndex')
  async approveChunk(
    @Param('id') jobId: string,
    @Param('chunkIndex') chunkIndex: number,
    @Body() corrections: CleaningResult[]
  ) {
    return this.jobsService.saveChunkCorrections(
      jobId,
      chunkIndex,
      corrections
    );
  }

  @Post('flush')
  async flushQueue() {
    await this.queueService.flush();
    return { status: 'Queue flushed' };
  }
}
