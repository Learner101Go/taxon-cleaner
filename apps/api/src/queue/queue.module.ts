import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CleaningProcessor } from './processors/cleaning.processor';
import { ProcessingModule } from '../processing/processing.module';
import { QueueService } from './queue.service';
import { FlowProducer } from 'bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cleaning',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    ProcessingModule,
  ],
  providers: [
    CleaningProcessor,
    QueueService,
    {
      provide: FlowProducer,
      useFactory: () =>
        new FlowProducer({
          connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
          },
        }),
    },
  ],
  exports: [QueueService, FlowProducer],
})
export class QueueModule {}
