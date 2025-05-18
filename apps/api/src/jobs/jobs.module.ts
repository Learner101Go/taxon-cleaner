import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { QueueModule } from '../queue/queue.module';
// import { ProcessingModule } from '../processing/processing.module';
// import { ConfigModule } from '../config/config.module';

@Module({
  imports: [QueueModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
