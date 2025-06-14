// // apps/api/src/jobs/jobs.controller.ts
// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Patch,
//   Post,
//   Res,
//   NotFoundException,
// } from '@nestjs/common';
// import { JobsService } from './jobs.service';
// import { QueueService } from '../queue/queue.service';
// import {
//   CreateJobResponseDto,
//   DataSettings,
//   JobData,
//   JobProgress,
//   TaxonRecord,
// } from '../shared/types';
// import { Response } from 'express';

// @Controller('jobs')
// export class JobsController {
//   constructor(
//     private readonly jobsService: JobsService,
//     private queueService: QueueService
//   ) {}

//   @Post()
//   async create(
//     @Body() body: { data: TaxonRecord[]; settings: DataSettings }
//   ): Promise<CreateJobResponseDto> {
//     const { data, settings } = body;
//     console.log(
//       'Incoming records:',
//       data.length,
//       'chunkSize:',
//       settings.chunkSize
//     );

//     const jobData: JobData = {
//       records: data,
//       source: settings.currentSource,
//       chunkSize: settings.chunkSize,
//     };
//     return this.jobsService.createJob(jobData);
//   }

//   @Patch(':id/chunks/:chunkIndex')
//   async approveChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number,
//     @Body() corrections: any
//   ) {
//     return this.jobsService.saveChunkCorrections(
//       jobId,
//       chunkIndex,
//       corrections
//     );
//   }

//   @Get(':id/chunks/:chunkIndex')
//   async getChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number
//   ) {
//     const chunkResult = this.jobsService.getChunkResults(jobId, chunkIndex);
//     console.log('chunkResult >>>>>: ', chunkResult);
//     return chunkResult;
//   }

//   @Post(':id/finalize')
//   async finalizeJob(@Param('id') jobId: string) {
//     // Placeholder: implement save logic
//     return { status: 'Finalized', jobId };
//   }

//   @Post('flush')
//   async flushQueue() {
//     await this.queueService.flush();
//     return { status: 'Queue flushed' };
//   }

//   @Get(':id/progress')
//   async getJobProgress(@Param('id') jobId: string) {
//     const job = await this.jobsService.safeGetJob(jobId);
//     return job.progress;
//   }

//   @Get(':id/export')
//   async exportJob(@Param('id') jobId: string, @Res() res: Response) {
//     const job = await this.jobsService.safeGetJob(jobId);
//     const progress = (await job.progress) as any;
//     const allChunks = (progress.chunks || []).flat();
//     res.set({
//       'Content-Type': 'application/json',
//       'Content-Disposition': `attachment; filename="cleaned-job-${jobId}.json"`,
//     });
//     res.send(JSON.stringify(allChunks, null, 2));
//   }

//   @Get(':id/status')
//   async getJobStatus(@Param('id') jobId: string) {
//     const job = await this.jobsService.safeGetJob(jobId);
//     const progress = (await job.progress) as JobProgress;
//     return {
//       status: await job.getState(),
//       progress,
//       isComplete: progress.currentChunk === progress.totalChunks,
//     };
//   }
// }

// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Patch,
//   Post,
//   NotFoundException,
// } from '@nestjs/common';
// import { JobsService } from './jobs.service';
// import {
//   CreateJobResponseDto,
//   DataSettings,
//   JobData,
//   JobProgress,
//   CleaningResult,
//   TaxonRecord,
// } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Controller('jobs')
// export class JobsController {
//   constructor(
//     private readonly jobsService: JobsService,
//     private queueService: QueueService
//   ) {}

//   /**
//    * POST /api/jobs
//    * Returns { jobIds: string[], totalChunks: number }
//    */
//   @Post()
//   async create(
//     @Body() body: { data: TaxonRecord[]; settings: DataSettings }
//   ): Promise<{ jobIds: string[]; totalChunks: number }> {
//     const { data, settings } = body;
//     console.log('data coming from frontend (only first 5): ', data.slice(0, 5));
//     console.log('settings coming from frontend: ', settings);
//     const jobData: JobData = {
//       records: data,
//       source: settings.currentSource,
//       chunkSize: settings.chunkSize,
//       confidenceThreshold: settings.confidenceThreshold,
//       autoCorrectAuthors: settings.autoCorrectAuthors,
//       validateCoordinates: settings.validateCoordinates,
//       resolveTaxonomy: settings.resolveTaxonomy,
//     };
//     const job = this.jobsService.createJob(jobData);
//     console.log(
//       'this is what this.jobsService.createJob(jobData) method in jobs.controller returned: ',
//       job
//     );
//     return job;
//   }

//   /**
//    * GET /api/jobs/:id/chunks/:chunkIndex
//    * Returns CleaningResult[]
//    */
//   @Get(':id/chunks/:chunkIndex')
//   async getChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number
//   ): Promise<CleaningResult[]> {
//     const chunk = await this.jobsService.getChunkResults(jobId, chunkIndex);
//     return chunk;
//   }

//   /**
//    * PATCH /api/jobs/:id/chunks/:chunkIndex
//    * Body: CleaningResult[]
//    */
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

//   /**
//    * GET /api/jobs/:id/progress
//    * Returns { chunks: (CleaningResult[]|null)[], currentChunk: number, totalChunks: number }
//    */
//   @Get(':id/progress')
//   async getProgress(@Param('id') jobId: string): Promise<JobProgress> {
//     return this.queueService.getJobProgress(jobId);
//   }

//   /** (unchanged) POST /api/jobs/flush */
//   @Post('flush')
//   async flushQueue() {
//     return this.jobsService.flushAllJobs();
//   }
// }

//////////////////////////////////////////////////////////////

// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Patch,
//   Post,
//   NotFoundException,
// } from '@nestjs/common';
// import { JobsService } from './jobs.service';
// import {
//   CreateJobResponseDto,
//   DataSettings,
//   JobData,
//   JobProgress,
//   CleaningResult,
//   TaxonRecord,
//   JobStatus,
// } from '../shared/types';
// import { QueueService } from '../queue/queue.service';

// @Controller('jobs')
// export class JobsController {
//   constructor(
//     private readonly jobsService: JobsService,
//     private queueService: QueueService
//   ) {}

//   /**
//    * POST /api/jobs
//    * Returns { jobIds: string[], totalChunks: number }
//    */
//   @Post()
//   async create(
//     @Body() body: { data: TaxonRecord[]; settings: DataSettings }
//   ): Promise<CreateJobResponseDto> {
//     const { data, settings } = body;

//     const jobData: JobData = {
//       records: data,
//       source: settings.currentSource,
//       chunkSize: settings.chunkSize,
//       confidenceThreshold: settings.confidenceThreshold,
//       autoCorrectAuthors: settings.autoCorrectAuthors,
//       validateCoordinates: settings.validateCoordinates,
//       resolveTaxonomy: settings.resolveTaxonomy,
//     };

//     try {
//       const job = await this.jobsService.createJob(jobData);
//       console.log('Job created successfully:', job);
//       return job;
//     } catch (error) {
//       console.error('Error creating job:', error);
//       throw error;
//     }
//   }

//   /**
//    * GET /api/jobs/:id/chunks/:chunkIndex
//    * Returns CleaningResult[]
//    */
//   @Get(':id/chunks/:chunkIndex')
//   async getChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number
//   ): Promise<CleaningResult[]> {
//     const chunk = await this.jobsService.getChunkResults(jobId, +chunkIndex);
//     return chunk;
//   }

//   /**
//    * PATCH /api/jobs/:id/chunks/:chunkIndex
//    * Body: CleaningResult[]
//    */
//   @Patch(':id/chunks/:chunkIndex')
//   async approveChunk(
//     @Param('id') jobId: string,
//     @Param('chunkIndex') chunkIndex: number,
//     @Body() corrections: CleaningResult[]
//   ) {
//     return this.jobsService.saveChunkCorrections(
//       jobId,
//       +chunkIndex,
//       corrections
//     );
//   }

//   /**
//    * GET /api/jobs/:id/progress
//    * Returns { chunks: (CleaningResult[]|null)[], currentChunk: number, totalChunks: number }
//    */
//   @Get(':id/progress')
//   async getProgress(@Param('id') jobId: string): Promise<JobProgress> {
//     return this.queueService.getJobProgress(jobId);
//   }

//   /** (unchanged) POST /api/jobs/flush */
//   @Post('flush')
//   async flushQueue() {
//     return this.jobsService.flushAllJobs();
//   }
// }

////////////////////////////////////////////////////////////////////////

// src/jobs/jobs.controller.ts (Updated)
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import {
  CreateSessionResponse,
  DataSettings,
  CleaningResult,
  TaxonRecord,
  SessionProgress,
} from '../shared/types';

@Controller('sessions')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async createSession(
    @Body() body: { data: TaxonRecord[]; settings: DataSettings }
  ): Promise<CreateSessionResponse> {
    const { data, settings } = body;
    return this.jobsService.createSession(data, settings);
  }

  @Get(':sessionId/progress')
  async getProgress(
    @Param('sessionId') sessionId: string
  ): Promise<SessionProgress> {
    return this.jobsService.getSessionProgress(sessionId);
  }

  @Get(':sessionId/chunks/:chunkIndex')
  async getChunk(
    @Param('sessionId') sessionId: string,
    @Param('chunkIndex') chunkIndex: number
  ): Promise<CleaningResult[]> {
    return this.jobsService.getChunk(sessionId, +chunkIndex);
  }

  @Patch(':sessionId/chunks/:chunkIndex')
  async approveChunk(
    @Param('sessionId') sessionId: string,
    @Param('chunkIndex') chunkIndex: number,
    @Body() corrections: CleaningResult[]
  ) {
    return this.jobsService.approveChunk(sessionId, +chunkIndex, corrections);
  }

  @Get(':sessionId/results')
  async getAllResults(
    @Param('sessionId') sessionId: string
  ): Promise<CleaningResult[]> {
    return this.jobsService.getAllResults(sessionId);
  }

  @Delete(':sessionId')
  async cleanupSession(@Param('sessionId') sessionId: string) {
    await this.jobsService.cleanupSession(sessionId);
    return { success: true };
  }

  @Post('flush')
  async flushSessions() {
    return this.jobsService.flushAllSessions();
  }
}
