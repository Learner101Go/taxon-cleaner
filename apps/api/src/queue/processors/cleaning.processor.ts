// src/queue/processors/cleaning.processor.ts
import { Processor, WorkerHost, OnWorkerEvent, JOB_REF } from '@nestjs/bullmq'; // NestJS BullMQ integration :contentReference[oaicite:3]{index=3}
import { Job } from 'bullmq'; // BullMQ Job type :contentReference[oaicite:4]{index=4}
import {
  AuthorResult,
  CleaningResult,
  JobData,
  JobProgress,
  TaxonRecord,
} from '../../shared/types';
import { AuthorService } from '../../processing/author/author.service';
import { CoordinateService } from '../../processing/coordinate/coordinate.service';
import { TaxonService } from '../../processing/taxon/taxon.service';
import { Inject } from '@nestjs/common';

@Processor('cleaning')
export class CleaningProcessor extends WorkerHost {
  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService
  ) {
    super();
  }

  // async process(job: Job<JobData>): Promise<CleaningResult[]> {
  //   console.log(
  //     `🛠 Processing job ${job.id}, chunk ${job.data.chunkIndex + 1}/${
  //       job.data.totalChunks
  //     }`
  //   );

  //   const chunkResults = await Promise.all(
  //     job.data.records.map((r) => this.processRecord(r, job.data.source))
  //   );

  //   // **Persist** the array in job.progress
  //   await job.updateProgress(chunkResults as any);
  //   console.log(`🛠 Persisted ${chunkResults.length} results for job ${job.id}`);

  //   return chunkResults;
  // }

  // async process(job: Job<JobData>): Promise<void> {
  //   console.log(
  //     `🛠 Processing job ${job.id} with ${job.data.totalChunks} chunks`
  //   );

  //   const results: CleaningResult[][] = [];

  //   for (const [index, chunk] of job.data.chunks!.entries()) {
  //     const chunkResults = await Promise.all(
  //       chunk.map((r) => this.processRecord(r, job.data.source))
  //     );

  //     results[index] = chunkResults;
  //     await job.updateProgress({
  //       chunks: results,
  //       currentChunk: index,
  //       totalChunks: job.data.totalChunks,
  //     } as JobProgress);
  //   }
  // }

  // async process(job: Job<JobData>) {
  //   const results = [];

  //   for (const [index, chunk] of job.data.chunks.entries()) {
  //     const processed = await Promise.all(
  //       chunk.map((record) => this.processRecord(record, job.data.source))
  //     );
  //     await job.updateProgress({ ...job.progress, [index]: processed });
  //     results[index] = processed;
  //   }

  //   return results;
  // }

  async process(job: Job<JobData>) {
    const results = [];
    const initialProgress =
      typeof job.progress === 'object' ? job.progress : {};

    for (const [index, chunk] of job.data.chunks.entries()) {
      const processed = await Promise.all(
        chunk.map((record) => this.processRecord(record, job.data.source))
      );

      await job.updateProgress({
        ...initialProgress,
        [index]: processed,
      });

      results[index] = processed;
    }

    return results;
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
