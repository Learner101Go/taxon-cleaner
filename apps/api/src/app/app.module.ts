import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { JobsModule } from '../jobs/jobs.module';
import { ProcessingModule } from '../processing/processing.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '@taxon-cleaner/api-database';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(), // needed if I later switched to custom config file
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    AuthModule,
    ProcessingModule,
    QueueModule,
    JobsModule,
    DatabaseModule,
  ],
})
export class AppModule {}
