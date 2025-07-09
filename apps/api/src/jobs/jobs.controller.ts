import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import {
  CreateSessionResponseDto,
  DataSettings,
  SessionProgress,
  CleaningResult,
  TaxonRecord,
} from '../shared/types';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * POST /api/jobs - Create new cleaning session
   */
  @Post()
  async createSession(
    @Body() body: { data: TaxonRecord[]; settings: DataSettings }
  ): Promise<CreateSessionResponseDto> {
    const { data, settings } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new BadRequestException('Invalid data array provided');
    }

    try {
      const session = await this.jobsService.createSession(data, settings);
      console.log('Session created successfully:', session.sessionId);
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * GET /api/jobs/:sessionId/progress - Get session progress
   */
  @Get(':sessionId/progress')
  async getSessionProgress(
    @Param('sessionId') sessionId: string
  ): Promise<SessionProgress> {
    return this.jobsService.getSessionProgress(sessionId);
  }

  /**
   * GET /api/jobs/:sessionId/chunks/:chunkIndex - Get specific chunk data
   */
  @Get(':sessionId/chunks/:chunkIndex')
  async getChunk(
    @Param('sessionId') sessionId: string,
    @Param('chunkIndex') chunkIndex: number
  ): Promise<CleaningResult[]> {
    const chunk = await this.jobsService.getChunk(sessionId, +chunkIndex);
    return chunk;
  }

  /**
   * PATCH /api/jobs/:sessionId/chunks/:chunkIndex - Save chunk corrections
   */
  @Patch(':sessionId/chunks/:chunkIndex')
  async saveChunkCorrections(
    @Param('sessionId') sessionId: string,
    @Param('chunkIndex') chunkIndex: number,
    @Body() corrections: CleaningResult[]
  ) {
    return this.jobsService.saveChunkCorrections(
      sessionId,
      +chunkIndex,
      corrections
    );
  }

  /**
   * GET /api/jobs/:sessionId/results - Get all corrected results
   */
  @Get(':sessionId/results')
  async getSessionResults(
    @Param('sessionId') sessionId: string
  ): Promise<CleaningResult[]> {
    return this.jobsService.getAllResults(sessionId);
  }

  /**
   * POST /api/jobs/flush - Clear all sessions (development)
   */
  @Post('flush')
  async flushSessions() {
    return this.jobsService.flushAllSessions();
  }
}
