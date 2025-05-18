import { JobEntity } from '../entities/job.entity';
import { ApiProperty } from '@nestjs/swagger';
import { JobState } from '../enums/job-state';

export class JobResponseDto implements Partial<JobEntity> {
  records: any[];
  source: string;
  chunkIndex: number;

  @ApiProperty()
  id: string;

  @ApiProperty()
  state: JobState;

  @ApiProperty()
  totalChunks: number;

  @ApiProperty()
  processedChunks: number;

  @ApiProperty()
  createdAt: Date;
}
