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
            port: +process.env.REDIS_PORT,
          },
        }),
    },
  ],
  exports: [QueueService, FlowProducer],
})
export class QueueModule {}
