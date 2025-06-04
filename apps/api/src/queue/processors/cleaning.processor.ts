import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  CleaningResult,
  JobData,
  TaxonRecord,
  Issue,
  AuthorSuggestion,
  CoordSuggestion,
  TaxonSuggestion,
  AuthorResult,
} from '../../shared/types';
import { AuthorService } from '../../processing/author/author.service';
import { CoordinateService } from '../../processing/coordinate/coordinate.service';
import { TaxonService } from '../../processing/taxon/taxon.service';
import { QueueService } from '../queue.service';

@Processor('cleaning')
export class CleaningProcessor extends WorkerHost {
  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService,
    private readonly queueService: QueueService
  ) {
    super();
  }

  /**
   * This is invoked by BullMQ for each job (i.e. for each chunk).
   */
  async process(job: Job<JobData>) {
    try {
      console.log(
        `Processing job ${job.id}, chunk ${job.data.chunkIndex} of ${job.data.totalChunks}`
      );

      // Process all records in this chunk in parallel, but still update progress every so often.
      const processed = await Promise.all(
        job.data.records.map((record, index) => {
          if (index % 10 === 0) {
            const progress = Math.floor(
              (index / job.data.records.length) * 100
            );
            job.updateProgress(progress);
          }
          return this.processRecord(record, job.data.source, job.data);
        })
      );

      // Final progress update
      await job.updateProgress(100);

      console.log(
        `✅ Completed processing ${processed.length} records in chunk ${job.data.chunkIndex}`
      );
      return processed;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error; // Rethrow so Bull marks it as failed
    }
  }

  /**
   * processRecord(...) takes one TaxonRecord and returns a CleaningResult.
   * It now calls authorService.normalizeAll(...) (which returns an array of AuthorResult),
   * instead of the old single‐normalize approach.
   */
  private async processRecord(
    record: TaxonRecord,
    source: string,
    jobData: JobData
  ): Promise<CleaningResult> {
    try {
      const allIssues: Issue[] = [];
      const allSuggestions: (
        | AuthorSuggestion
        | CoordSuggestion
        | TaxonSuggestion
      )[] = [];

      // Start with a shallow copy of original
      const accepted: TaxonRecord = { ...record };

      // 1) AUTHOR NORMALIZATION (if enabled and there is an authorship string)
      if (jobData.autoCorrectAuthors && record.scientificNameAuthorship) {
        // normalizeAll returns one AuthorResult per split‐token (e.g. ["L.", "Smith", ...])
        const authorResults: AuthorResult[] =
          await this.authorService.normalizeAll(
            record.scientificNameAuthorship
          );

        // Collect issues and suggestions from every token
        authorResults.forEach((tokenResult) => {
          allIssues.push(...tokenResult.issues);
          allSuggestions.push(...tokenResult.suggestions);
        });

        // Auto-apply: pick the single suggestion with highest confidence (if any)
        const flatSuggestions = authorResults
          .flatMap((r) => r.suggestions ?? [])
          // sort descending by confidence
          .sort((a, b) => b.confidence - a.confidence);

        if (flatSuggestions.length > 0) {
          const best = flatSuggestions[0];
          if (best.confidence >= (jobData.confidenceThreshold ?? 0.8)) {
            // For simplicity, we replace the entire authorship with that single best correctedAuthor.
            // (If you wanted to re-join multiple tokens, you could also join every tokenResult.original => tokenResult.suggestions[0], etc.)
            accepted.scientificNameAuthorship = best.correctedAuthor;
          }
        }
      }

      // 2) COORDINATE VALIDATION (if enabled and numerics present)
      if (
        jobData.validateCoordinates &&
        record.decimalLatitude != null &&
        record.decimalLongitude != null
      ) {
        const coordResult = await this.coordinateService.validate(
          record.decimalLatitude,
          record.decimalLongitude
        );
        allIssues.push(...coordResult.issues);
        allSuggestions.push(...coordResult.suggestions);

        // Auto-apply top coordinate suggestion if confidence passes threshold
        if (coordResult.suggestions.length > 0) {
          const bestCoord = coordResult.suggestions[0];
          if (bestCoord.confidence >= (jobData.confidenceThreshold ?? 0.8)) {
            accepted.decimalLatitude = bestCoord.suggestedLat;
            accepted.decimalLongitude = bestCoord.suggestedLng;
          }
        }
      }

      // 3) TAXON RESOLUTION (if enabled and scientificName present)
      if (jobData.resolveTaxonomy && record.scientificName) {
        const taxonResult = await this.taxonService.resolveTaxon(
          record.scientificName,
          source
        );
        allIssues.push(...taxonResult.issues);

        // Convert that taxonResult into TaxonSuggestion[]
        const taxonSuggestions: TaxonSuggestion[] =
          this.taxonService.getSuggestions(taxonResult);
        allSuggestions.push(...taxonSuggestions);

        // Auto-apply top taxon suggestion if confidence passes threshold
        if (taxonSuggestions.length > 0) {
          const bestTaxon = taxonSuggestions[0];
          if (bestTaxon.confidence >= (jobData.confidenceThreshold ?? 0.8)) {
            if (bestTaxon.acceptedName) {
              accepted.scientificName = bestTaxon.acceptedName;
            }
            if (bestTaxon.family) {
              accepted.family = bestTaxon.family;
            }
            if (bestTaxon.genus) {
              accepted.genus = bestTaxon.genus;
            }
          }
        }
      }

      return {
        original: record,
        issues: allIssues,
        suggestions: allSuggestions,
        accepted,
        metadata: {
          timestamp: new Date().toISOString(),
          processedBy: 'auto-processor',
          autoApplied: true,
        },
      };
    } catch (error) {
      console.error('Error processing record:', error);
      return {
        original: record,
        issues: [
          {
            type: 'error',
            message: `Processing error: ${error.message}`,
          },
        ],
        suggestions: [],
        accepted: record, // fallback to original if something blew up
        metadata: {
          timestamp: new Date().toISOString(),
          processedBy: 'auto-processor',
          autoApplied: false,
        },
      };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JobData>) {
    console.log(
      `✅ Job ${job.id} (chunk ${job.data.chunkIndex}) fully completed`
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JobData>, error: Error) {
    console.error(
      `❌ Job ${job.id} (chunk ${job.data.chunkIndex}) failed: ${error.message}`
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<JobData>, progress: number) {
    console.log(
      `🔄 Job ${job.id} (chunk ${job.data.chunkIndex}) progress: ${progress}%`
    );
  }
}
