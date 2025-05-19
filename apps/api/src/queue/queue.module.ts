import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CleaningProcessor } from './processors/cleaning.processor';
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
