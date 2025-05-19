// // apps/api/src/jobs/jobs.controller.ts
// import { Controller, Post, Body, Get, Param, Patch, Res } from '@nestjs/common';
// import { JobsService } from './jobs.service';
// import {
//   CleaningResult,
//   CreateJobResponseDto,
//   DataSettings,
//   JobData,
//   JobProgress,
//   TaxonRecord,
// } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Controller('jobs')
// export class JobsController {
//   constructor(
//     private readonly jobsService: JobsService,
//     private queueService: QueueService
//   ) {}

//   @Post()
//   async create(body: {
//     data: TaxonRecord[];
//     settings: DataSettings;
//   }): Promise<CreateJobResponseDto> {
//     const { data, settings } = body;
//     const jobData: JobData = {
//       records: data,
//       source: settings.currentSource,
//       chunkSize: settings.chunkSize,
//     };

//     return this.jobsService.createJob(jobData);
//   }

//   @Post(':id/finalize')
//   async finalizeJob(@Param('id') jobId: string) {
//     // Implement save-to-database logic here
//     return { status: 'Finalized', jobId };
//   }

//   @Get(':id/export')
//   async exportJob(@Param('id') jobId: string, @Res() res) {
//     // Gather all cleaned results for jobId
//     const job = await this.jobsService.safeGetJob(jobId);
//     const progress = (await job.progress) as JobProgress;
//     const allChunks = (progress.chunks || []).flat();
//     res.set({
//       'Content-Type': 'application/json',
//       'Content-Disposition': `attachment; filename="cleaned-job-${jobId}.json"`,
//     });
//     res.send(JSON.stringify(allChunks, null, 2));
//   }

//   @Get(':id/chunks/:chunkIndex')
//   async getChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number
//   ) {
//     return this.jobsService.getChunkResults(jobId, chunkIndex);
//   }

//   @Get(':id/progress')
//   async getJobProgress(@Param('id') jobId: string) {
//     const job = await this.jobsService.safeGetJob(jobId);
//     return job.progress;
//   }

//   @Patch(':id/chunks/:chunkIndex')
//   async approveChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number,
//     @Body() corrections: CleaningResult[]
//   ) {
//     return this.jobsService.saveChunkCorrections(
//       jobId,
//       chunkIndex,
//       corrections
//     );
//   }

//   @Post('flush')
//   async flushQueue() {
//     await this.queueService.flush();
//     return { status: 'Queue flushed' };
//   }
// }

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { QueueService } from '../queue/queue.service';
import {
  CreateJobResponseDto,
  DataSettings,
  JobData,
  TaxonRecord,
} from '../shared/types';
import { Response } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private queueService: QueueService
  ) {}

  @Post()
  async create(
    @Body() body: { data: TaxonRecord[]; settings: DataSettings }
  ): Promise<CreateJobResponseDto> {
    const { data, settings } = body;
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
    @Body() corrections: any
  ) {
    return this.jobsService.saveChunkCorrections(
      jobId,
      chunkIndex,
      corrections
    );
  }

  @Post(':id/finalize')
  async finalizeJob(@Param('id') jobId: string) {
    // Placeholder: implement save logic
    return { status: 'Finalized', jobId };
  }

  @Get(':id/export')
  async exportJob(@Param('id') jobId: string, @Res() res: Response) {
    const job = await this.jobsService.safeGetJob(jobId);
    const progress = (await job.progress) as any;
    const allChunks = (progress.chunks || []).flat();
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="cleaned-job-${jobId}.json"`,
    });
    res.send(JSON.stringify(allChunks, null, 2));
  }

  @Post('flush')
  async flushQueue() {
    await this.queueService.flush();
    return { status: 'Queue flushed' };
  }
}
