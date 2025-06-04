import { Module } from '@nestjs/common';
// 1️⃣ NestJS built-in ConfigModule
// import { ConfigModule } from '@nestjs/config';
// import { ConfigModule } from '../config/config.module';

// 2️⃣ Your custom validation schema
import configuration, { configValidationSchema } from '../config/configuration';
// Feature modules you defined under src/queue, src/jobs, src/processing
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
