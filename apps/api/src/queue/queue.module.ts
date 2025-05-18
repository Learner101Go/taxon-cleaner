import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
// import { createRedisConnection } from '../utils/redis.util';
import { CleaningProcessor } from './processors/cleaning.processor';
// import { JobProcessor } from './processors/job.processor';
import { ProcessingModule } from '../processing/processing.module';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cleaning',
    }),
    ProcessingModule,
  ],
  providers: [CleaningProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
