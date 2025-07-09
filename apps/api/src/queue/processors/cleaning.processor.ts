// import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
// import { Job } from 'bullmq';
// import {
//   CleaningResult,
//   JobData,
//   TaxonRecord,
//   Issue,
//   AuthorSuggestion,
//   CoordSuggestion,
//   TaxonSuggestion,
//   AuthorResult,
// } from '../../shared/types';
// import { AuthorService } from '../../processing/author/author.service';
// import { CoordinateService } from '../../processing/coordinate/coordinate.service';
// import { TaxonService } from '../../processing/taxon/taxon.service';

// @Processor('cleaning')
// export class CleaningProcessor extends WorkerHost {
//   /**
//    * for each sessionId, a Map of “raw → auto-fixed” strings
//    * discovered via Level-2 matches
//    */
//   private autoCorrection = new Map<string, Map<string, string>>();

//   constructor(
//     private readonly authorService: AuthorService,
//     private readonly coordinateService: CoordinateService,
//     private readonly taxonService: TaxonService
//   ) {
//     super();
//   }

//   async process(job: Job<JobData>): Promise<CleaningResult[]> {
//     try {
//       console.log(
//         `Processing session ${job.data.sessionId}, chunk ${job.data.chunkIndex} of ${job.data.totalChunks}`
//       );

//       const processed = await Promise.all(
//         job.data.records.map(async (record, index) => {
//           if (index % 5 === 0) {
//             const progress = Math.floor(
//               (index / job.data.records.length) * 100
//             );
//             await job.updateProgress(progress);
//           }
//           return this.processRecord(record, job.data.settings);
//         })
//       );

//       await job.updateProgress(100);

//       console.log(
//         `✅ Completed processing ${processed.length} records in chunk ${job.data.chunkIndex} for session ${job.data.sessionId}`
//       );

//       return processed;
//     } catch (error) {
//       console.error(`Error processing job ${job.id}:`, error);
//       throw error;
//     }
//   }

//   private async processRecord(
//     record: TaxonRecord,
//     settings: any
//   ): Promise<CleaningResult> {
//     try {
//       const allIssues: Issue[] = [];
//       const allSuggestions: (
//         | AuthorSuggestion
//         | CoordSuggestion
//         | TaxonSuggestion
//       )[] = [];

//       const accepted: TaxonRecord = { ...record };
//       let cleanedName: string;
//       // AUTHOR NORMALIZATION - Main focus for author cleaning tool
//       if (settings.autoCorrectAuthors && record.authorName) {
//         const authorResults: AuthorResult[] =
//           await this.authorService.normalizeAll(record.authorName);

//         cleanedName =
//           authorResults.find(
//             (r) => typeof r.cleaned === 'string' && r.cleaned !== ''
//           )?.cleaned ?? record.authorName;

//         authorResults.forEach((tokenResult) => {
//           allIssues.push(...tokenResult.issues);
//           allSuggestions.push(...tokenResult.suggestions);
//         });

//         // For author tool, we don't auto-apply corrections
//         // Just provide suggestions for user review
//         const flatSuggestions = authorResults
//           .flatMap((r) => r.suggestions ?? [])
//           .sort((a, b) => b.confidence - a.confidence);

//         // Keep original author name, let user decide
//         accepted.authorName = record.authorName;

//         // If we have high-confidence suggestions, mark them for user attention
//         if (
//           flatSuggestions.length > 0 &&
//           flatSuggestions[0].confidence >= 0.9
//         ) {
//           allIssues.push({
//             type: 'info',
//             message: `High-confidence correction available: ${flatSuggestions[0].correctedAuthor}`,
//             field: 'authorName',
//           });
//         }
//       }

//       // COORDINATE VALIDATION (optional)
//       if (
//         settings.validateCoordinates &&
//         record.decimalLatitude != null &&
//         record.decimalLongitude != null
//       ) {
//         const coordResult = await this.coordinateService.validate(
//           record.decimalLatitude,
//           record.decimalLongitude
//         );
//         allIssues.push(...coordResult.issues);
//         allSuggestions.push(...coordResult.suggestions);
//       }

//       // TAXON RESOLUTION (optional)
//       if (settings.resolveTaxonomy && record.scientificName) {
//         const taxonResult = await this.taxonService.resolveTaxon(
//           record.scientificName,
//           settings.currentSource
//         );
//         allIssues.push(...taxonResult.issues);

//         const taxonSuggestions: TaxonSuggestion[] =
//           this.taxonService.getSuggestions(taxonResult);
//         allSuggestions.push(...taxonSuggestions);
//       }

//       return {
//         original: record,
//         cleaned: cleanedName,
//         issues: allIssues,
//         suggestions: allSuggestions,
//         accepted,
//         metadata: {
//           timestamp: new Date().toISOString(),
//           processedBy: 'author-processor',
//           autoApplied: false, // For author tool, no auto-corrections
//         },
//       };
//     } catch (error) {
//       console.error('Error processing record:', error);
//       return {
//         original: record,
//         issues: [
//           {
//             type: 'error',
//             message: `Processing error: ${error.message}`,
//           },
//         ],
//         suggestions: [],
//         accepted: record,
//         metadata: {
//           timestamp: new Date().toISOString(),
//           processedBy: 'author-processor',
//           autoApplied: false,
//         },
//       };
//     }
//   }

//   @OnWorkerEvent('completed')
//   onCompleted(job: Job<JobData>) {
//     console.log(
//       `✅ Job ${job.id} (session ${job.data.sessionId}, chunk ${job.data.chunkIndex}) completed`
//     );
//   }

//   @OnWorkerEvent('failed')
//   onFailed(job: Job<JobData>, error: Error) {
//     console.error(
//       `❌ Job ${job.id} (session ${job.data.sessionId}, chunk ${job.data.chunkIndex}) failed: ${error.message}`
//     );
//   }

//   @OnWorkerEvent('progress')
//   onProgress(job: Job<JobData>, progress: number) {
//     console.log(
//       `🔄 Job ${job.id} (session ${job.data.sessionId}, chunk ${job.data.chunkIndex}) progress: ${progress}%`
//     );
//   }
// }

//////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

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

@Processor('cleaning')
export class CleaningProcessor extends WorkerHost {
  /**
   * Session-based caching: sessionId -> Map<original, corrected>
   * This ensures corrections persist across chunks within the same session
   */
  private sessionCaches = new Map<string, Map<string, string>>();

  constructor(
    private readonly authorService: AuthorService,
    private readonly coordinateService: CoordinateService,
    private readonly taxonService: TaxonService
  ) {
    super();
  }

  async process(job: Job<JobData>): Promise<CleaningResult[]> {
    try {
      console.log(
        `Processing session ${job.data.sessionId}, chunk ${job.data.chunkIndex} of ${job.data.totalChunks}`
      );

      // Initialize or retrieve session cache
      const sessionId = job.data.sessionId;
      if (!this.sessionCaches.has(sessionId)) {
        this.sessionCaches.set(sessionId, new Map<string, string>());
        console.log(`🆕 Created new cache for session ${sessionId}`);
      }

      const sessionCache = this.sessionCaches.get(sessionId)!;

      // Set the cache in AuthorService so it can use existing corrections
      this.authorService.setCache(sessionCache);
      console.log(
        `📋 Session ${sessionId} cache has ${sessionCache.size} entries`
      );

      const processed = await Promise.all(
        job.data.records.map(async (record, index) => {
          if (index % 5 === 0) {
            const progress = Math.floor(
              (index / job.data.records.length) * 100
            );
            await job.updateProgress(progress);
          }
          return this.processRecord(record, job.data.settings, sessionId);
        })
      );

      await job.updateProgress(100);

      console.log(
        `✅ Completed processing ${processed.length} records in chunk ${job.data.chunkIndex} for session ${job.data.sessionId}`
      );
      console.log(`💾 Session cache now has ${sessionCache.size} entries`);

      return processed;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  private async processRecord(
    record: TaxonRecord,
    settings: any,
    sessionId: string
  ): Promise<CleaningResult> {
    try {
      const allIssues: Issue[] = [];
      const allSuggestions: (
        | AuthorSuggestion
        | CoordSuggestion
        | TaxonSuggestion
      )[] = [];

      const accepted: TaxonRecord = { ...record };
      let cleanedName: string = record.authorName || '';
      let wasAutoCorrected = false;

      // AUTHOR NORMALIZATION - Main focus for author cleaning tool
      if (settings.autoCorrectAuthors && record.authorName) {
        console.log(`🔍 Processing author: "${record.authorName}"`);

        const authorResults: AuthorResult[] =
          await this.authorService.normalizeAll(record.authorName);

        if (authorResults.length > 0) {
          const mainResult = authorResults[0];
          cleanedName = mainResult.cleaned;

          // Check if this was an auto-correction (original != cleaned)
          wasAutoCorrected = mainResult.original !== mainResult.cleaned;

          if (wasAutoCorrected) {
            console.log(
              `🔧 AUTO-CORRECTED: "${mainResult.original}" -> "${mainResult.cleaned}"`
            );

            // Update the accepted record with the corrected name
            accepted.authorName = mainResult.cleaned;

            // Add info about the correction
            allIssues.push({
              type: 'info',
              message: `Auto-corrected from "${mainResult.original}" to "${mainResult.cleaned}"`,
              field: 'authorName',
            });
          } else {
            // No correction needed, keep original
            accepted.authorName = record.authorName;
          }

          // Add all other issues and suggestions from the author service
          authorResults.forEach((tokenResult) => {
            // Filter out the auto-correction info messages to avoid duplicates
            const filteredIssues = tokenResult.issues.filter(
              (issue) =>
                !(
                  issue.type === 'info' &&
                  issue.message.includes('Auto-corrected')
                )
            );
            allIssues.push(...filteredIssues);
            allSuggestions.push(...tokenResult.suggestions);
          });
        } else {
          // No results from author service, keep original
          accepted.authorName = record.authorName;
        }
      }

      // COORDINATE VALIDATION (optional)
      if (
        settings.validateCoordinates &&
        record.decimalLatitude != null &&
        record.decimalLongitude != null
      ) {
        const coordResult = await this.coordinateService.validate(
          record.decimalLatitude,
          record.decimalLongitude
        );
        allIssues.push(...coordResult.issues);
        allSuggestions.push(...coordResult.suggestions);
      }

      // TAXON RESOLUTION (optional)
      if (settings.resolveTaxonomy && record.scientificName) {
        const taxonResult = await this.taxonService.resolveTaxon(
          record.scientificName,
          settings.currentSource
        );
        allIssues.push(...taxonResult.issues);

        const taxonSuggestions: TaxonSuggestion[] =
          this.taxonService.getSuggestions(taxonResult);
        allSuggestions.push(...taxonSuggestions);
      }

      return {
        original: record,
        cleaned: cleanedName,
        issues: allIssues,
        suggestions: allSuggestions,
        accepted,
        metadata: {
          timestamp: new Date().toISOString(),
          processedBy: 'author-processor',
          autoApplied: wasAutoCorrected, // True if we auto-corrected the author
          sessionId: sessionId,
          corrections: wasAutoCorrected
            ? {
                field: 'authorName',
                from: record.authorName,
                to: accepted.authorName,
              }
            : undefined,
        },
      };
    } catch (error) {
      console.error('Error processing record:', error);
      return {
        original: record,
        cleaned: record.authorName || '',
        issues: [
          {
            type: 'error',
            message: `Processing error: ${error.message}`,
          },
        ],
        suggestions: [],
        accepted: record,
        metadata: {
          timestamp: new Date().toISOString(),
          processedBy: 'author-processor',
          autoApplied: false,
          sessionId: sessionId,
        },
      };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JobData>) {
    const sessionId = job.data.sessionId;
    const sessionCache = this.sessionCaches.get(sessionId);

    console.log(
      `✅ Job ${job.id} (session ${sessionId}, chunk ${job.data.chunkIndex}) completed`
    );

    if (sessionCache) {
      console.log(
        `💾 Session ${sessionId} cache entries: ${sessionCache.size}`
      );
      // Log cache contents for debugging (limit to first 5 entries)
      let count = 0;
      for (const [original, corrected] of sessionCache.entries()) {
        if (count++ >= 5) break;
        console.log(`   📝 "${original}" -> "${corrected}"`);
      }
      if (sessionCache.size > 5) {
        console.log(`   ... and ${sessionCache.size - 5} more entries`);
      }
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JobData>, error: Error) {
    console.error(
      `❌ Job ${job.id} (session ${job.data.sessionId}, chunk ${job.data.chunkIndex}) failed: ${error.message}`
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<JobData>, progress: number) {
    console.log(
      `🔄 Job ${job.id} (session ${job.data.sessionId}, chunk ${job.data.chunkIndex}) progress: ${progress}%`
    );
  }

  /**
   * Clean up session cache when session is complete
   * Call this method when all chunks for a session are processed
   */
  cleanupSession(sessionId: string): void {
    if (this.sessionCaches.has(sessionId)) {
      const cacheSize = this.sessionCaches.get(sessionId)!.size;
      this.sessionCaches.delete(sessionId);
      console.log(
        `🧹 Cleaned up session ${sessionId} cache (${cacheSize} entries)`
      );
    }
  }

  /**
   * Get current cache statistics for debugging
   */
  getCacheStats(): { totalSessions: number; totalEntries: number } {
    let totalEntries = 0;
    for (const cache of this.sessionCaches.values()) {
      totalEntries += cache.size;
    }
    return {
      totalSessions: this.sessionCaches.size,
      totalEntries,
    };
  }
}
