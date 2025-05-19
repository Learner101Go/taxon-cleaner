// src/queue/processors/cleaning.processor.ts
// import { Processor, WorkerHost, OnWorkerEvent, JOB_REF } from '@nestjs/bullmq'; // NestJS BullMQ integration :contentReference[oaicite:3]{index=3}
// import { Job } from 'bullmq'; // BullMQ Job type :contentReference[oaicite:4]{index=4}
// import {
//   AuthorResult,
//   CleaningResult,
//   JobData,
//   JobProgress,
//   TaxonRecord,
// } from '../../shared/types';
// import { AuthorService } from '../../processing/author/author.service';
// import { CoordinateService } from '../../processing/coordinate/coordinate.service';
// import { TaxonService } from '../../processing/taxon/taxon.service';
// import { Inject } from '@nestjs/common';

// @Processor('cleaning')
// export class CleaningProcessor extends WorkerHost {
//   constructor(
//     private readonly authorService: AuthorService,
//     private readonly coordinateService: CoordinateService,
//     private readonly taxonService: TaxonService
//   ) {
//     super();
//   }

//   async process(job: Job<JobData>) {
//     const progress = (
//       typeof job.progress === 'object' ? job.progress : {}
//     ) as JobProgress;
//     progress.chunks = progress.chunks || [];

//     for (const [index, chunk] of job.data.chunks.entries()) {
//       const processed = await Promise.all(
//         chunk.map((record) => this.processRecord(record, job.data.source))
//       );
//       progress.chunks[index] = processed;
//       await job.updateProgress(progress);
//     }

//     return progress.chunks;
//   }

//   private async processRecord(
//     record: TaxonRecord,
//     source: string
//   ): Promise<CleaningResult> {
//     const [a, c, t] = await Promise.all([
//       this.authorService.normalize(record.scientificNameAuthorship) as any,
//       this.coordinateService.validate(
//         record.decimalLatitude,
//         record.decimalLongitude
//       ),
//       this.taxonService.resolveTaxon(record.scientificName, source),
//     ]);
//     return {
//       original: record,
//       issues: [...a.issues, ...c.issues, ...t.issues],
//       suggestions: [...a.suggestions, ...this.taxonService.getSuggestions(t)],
//     };
//   }

//   @OnWorkerEvent('completed')
//   onCompleted(job: Job<JobData>) {
//     console.log(`✅ Job ${job.id} fully completed`);
//   }
// }

////////////////////////////
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  CleaningResult,
  JobData,
  JobProgress,
  TaxonRecord,
} from '../../shared/types';
import { AuthorService } from '../../processing/author/author.service';
import { CoordinateService } from '../../processing/coordinate/coordinate.service';
import { TaxonService } from '../../processing/taxon/taxon.service';

@Processor('cleaning')
export class CleaningProcessor extends WorkerHost {
  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    // Load or initialize progress
    let progress =
      typeof job.progress === 'object' && job.progress !== null
        ? (job.progress as JobProgress)
        : {
            chunks: [],
            currentChunk: 0,
            totalChunks: job.data.totalChunks || job.data.chunks.length,
          };

    progress.chunks = progress.chunks || [];

    for (const [index, chunk] of job.data.chunks.entries()) {
      const processed = await Promise.all(
        chunk.map((record) => this.processRecord(record, job.data.source))
      );
      // Save to correct place!
      progress.chunks[index] = processed;
      progress.currentChunk = index + 1;
      await job.updateProgress(progress);
    }

    return progress.chunks;
  }

  private async processRecord(
    record: TaxonRecord,
    source: string
  ): Promise<CleaningResult> {
    const [a, c, t] = await Promise.all([
      this.authorService.normalize(record.scientificNameAuthorship) as any,
      this.coordinateService.validate(
        record.decimalLatitude,
        record.decimalLongitude
      ),
      this.taxonService.resolveTaxon(record.scientificName, source),
    ]);
    return {
      original: record,
      issues: [...a.issues, ...c.issues, ...t.issues],
      suggestions: [...a.suggestions, ...this.taxonService.getSuggestions(t)],
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JobData>) {
    console.log(`✅ Job ${job.id} fully completed`);
  }
}
