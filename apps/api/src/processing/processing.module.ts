import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { QueueModule } from '../queue/queue.module';
import { ConfigModule } from '../config/config.module';
import { AuthorService } from './author/author.service';
import { CoordinateService } from './coordinate/coordinate.service';
import { TaxonService } from './taxon/taxon.service';
import { ProcessingService } from './taxon/processing.service';
import {
  DatabaseModule,
  IpniAuthor,
  PteridoAuthor,
} from '@taxon-cleaner/api-database';

@Module({
  imports: [ConfigModule, HttpModule, CacheModule.register(), DatabaseModule],
  providers: [
    AuthorService,
    CoordinateService,
    TaxonService,
    ProcessingService,
  ],
  exports: [AuthorService, CoordinateService, TaxonService, ProcessingService],
})
export class ProcessingModule {}
