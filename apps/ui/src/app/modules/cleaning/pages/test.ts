// I Still get the same issue that I tried to fix (stuck on Loading chunk data...) I get one more problem this time, the ui is kind of seems freezing. I can scroll up and down on /dashboard page but I cannot click the drop downs (cleaning rules, data sources, advanced) and event cannot select the texts on the ui!

// // backend logs
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [NestFactory] Starting Nest application...
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] AppModule dependencies initialized +54ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] HttpModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] JwtModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] HttpModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] ProcessingModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] ConfigModule
// dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] CacheModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] ConfigModule
// dependencies initialized +3ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] BullModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] AuthModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] QueueModule dependencies initialized +0ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [InstanceLoader] JobsModule dependencies initialized +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RoutesResolver] AuthController {/api/auth}: +71ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/auth/login, POST} route +14ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RoutesResolver] JobsController {/api/jobs}: +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/jobs, POST} route +2ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/jobs/:id/chunks/:chunkIndex, GET} route +3ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/jobs/:id/chunks/:chunkIndex, PATCH} route +5ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/jobs/:id/progress, GET} route +1ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [RouterExplorer] Mapped {/api/jobs/flush, POST} route +2ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG [NestApplication] Nest application successfully started +17ms
// [Nest] 14396  - 05/22/2025, 11:23:22 PM     LOG 🚀 Application is running on:
// http://localhost:3001/api
// data coming from frontend (only first 5):  [
//   {
//     scientificName: 'Pinus alba',
//     scientificNameAuthorship: 'L.',
//     taxonRank: 'species',
//     decimalLatitude: -74.950219,
//     decimalLongitude: -40.092419,
//     geodeticDatum: 'WGS84',
//     family: 'Pinusaceae',
//     genus: 'Pinus',
//     specificEpithet: 'alba',
//     infraspecificEpithet: null,
//     recordedBy: 'M.E. Barkworth',
//     occurrenceID: 'urn:uuid:36b0267d-bf85-49d3-b5e0-fc670431a02e',
//     eventDate: '2022-06-07'
//   },
//   {
//     scientificName: 'Betula alba',
//     scientificNameAuthorship: 'Brown',
//     taxonRank: 'species',
//     decimalLatitude: -13.790573,
//     decimalLongitude: 162.787199,
//     geodeticDatum: 'WGS84',
//     family: 'Betulaaceae',
//     genus: 'Betula',
//     specificEpithet: 'alba',
//     infraspecificEpithet: null,
//     recordedBy: 'J. Doe',
//     occurrenceID: 'urn:uuid:8ae05904-289f-49fe-9e5c-dcc8638a3413',
//     eventDate: '2020-03-28'
//   },
//   {
//     scientificName: 'Acer catus',
//     scientificNameAuthorship: 'Mill.',
//     taxonRank: 'species',
//     decimalLatitude: -20.573373,
//     decimalLongitude: 171.076833,
//     geodeticDatum: 'WGS84',
//     family: 'Aceraceae',
//     genus: 'Acer',
//     specificEpithet: 'catus',
//     infraspecificEpithet: null,
//     recordedBy: 'J. Doe',
//     occurrenceID: 'urn:uuid:7333d685-c678-407f-a6a5-14dae1dfc2ab',
//     eventDate: '2022-09-03'
//   },
//   {
//     scientificName: 'Felis papyrifera',
//     scientificNameAuthorship: 'Smith',
//     taxonRank: 'species',
//     decimalLatitude: 4.715854,
//     decimalLongitude: 144.724133,
//     geodeticDatum: 'WGS84',
//     family: 'Felisaceae',
//     genus: 'Felis',
//     specificEpithet: 'papyrifera',
//     infraspecificEpithet: null,
//     recordedBy: 'M.E. Barkworth',
//     occurrenceID: 'urn:uuid:e98ba199-bdaf-4cdb-8e10-785517173f2e',
//     eventDate: '2020-09-28'
//   },
//   {
//     scientificName: 'Pinus catus',
//     scientificNameAuthorship: 'Smith',
//     taxonRank: 'species',
//     decimalLatitude: 3.91874,
//     decimalLongitude: -105.582419,
//     geodeticDatum: 'WGS84',
//     family: 'Pinusaceae',
//     genus: 'Pinus',
//     specificEpithet: 'catus',
//     infraspecificEpithet: null,
//     recordedBy: 'Wildlife Survey',
//     occurrenceID: 'urn:uuid:8028c9ad-ed15-4db9-97b9-bf6cf35e01fe',
//     eventDate: '2021-06-17'
//   }
// ]
// settings coming from frontend:  {
//   autoCorrectAuthors: true,
//   validateCoordinates: true,
//   resolveTaxonomy: true,
//   chunkSize: 50,
//   confidenceThreshold: 0.8,
//   currentSource: 'symbiota2',
//   inputMethod: [ 'file-upload', 'text-input' ],
//   sources: []
// }
// Job created successfully: { jobIds: [ '1', '2', '3', '4' ], totalChunks: 4 }
// Processing job 1, chunk 0 of 4
// 🔄 Job 1 (chunk 0) progress: 0%
// 🔄 Job 1 (chunk 0) progress: 20%
// 🔄 Job 1 (chunk 0) progress: 40%
// 🔄 Job 1 (chunk 0) progress: 60%
// 🔄 Job 1 (chunk 0) progress: 80%
// 🔄 Job 1 (chunk 0) progress: 100%
// ✅ Completed processing 50 records in chunk 0
// ✅ Job 1 (chunk 0) fully completed
// Processing job 2, chunk 1 of 4
// 🔄 Job 2 (chunk 1) progress: 0%
// 🔄 Job 2 (chunk 1) progress: 20%
// 🔄 Job 2 (chunk 1) progress: 40%
// 🔄 Job 2 (chunk 1) progress: 60%
// 🔄 Job 2 (chunk 1) progress: 80%
// 🔄 Job 2 (chunk 1) progress: 100%
// ✅ Completed processing 50 records in chunk 1
// ✅ Job 2 (chunk 1) fully completed
// Processing job 3, chunk 2 of 4
// 🔄 Job 3 (chunk 2) progress: 0%
// 🔄 Job 3 (chunk 2) progress: 20%
// 🔄 Job 3 (chunk 2) progress: 40%
// 🔄 Job 3 (chunk 2) progress: 60%
// 🔄 Job 3 (chunk 2) progress: 80%
// 🔄 Job 3 (chunk 2) progress: 100%
// ✅ Completed processing 50 records in chunk 2
// ✅ Job 3 (chunk 2) fully completed
// Processing job 4, chunk 3 of 4
// 🔄 Job 4 (chunk 3) progress: 0%
// 🔄 Job 4 (chunk 3) progress: 20%
// 🔄 Job 4 (chunk 3) progress: 40%
// 🔄 Job 4 (chunk 3) progress: 60%
// 🔄 Job 4 (chunk 3) progress: 80%
// 🔄 Job 4 (chunk 3) progress: 100%
// ✅ Completed processing 50 records in chunk 3
// ✅ Job 4 (chunk 3) fully completed

// // browser console
// Angular is running in development mode.
// cleaning.service.ts:165 Starting cleaning session with 200 records
// cleaning.service.ts:174 Cleaning session started, job IDs: (4) ['5', '6', '7', '8']
// cleaning-dashboard.component.ts:849 Jobs created: {jobIds: Array(4), totalChunks: 4}
// cleaning.service.ts:231 Job 5 progress: {currentChunk: 4, totalChunks: 4, completedChunks: 4}
// cleaning-dashboard.component.ts:962 Loading chunk 0 from job 5
// cleaning.service.ts:184 Fetching chunk 0 from job 5
// cleaning.service.ts:231 Job 6 progress: {currentChunk: 4, totalChunks: 4, completedChunks: 4}
// cleaning-dashboard.component.ts:955 Already loading a chunk, skipping
// cleaning.service.ts:231 Job 7 progress: {currentChunk: 4, totalChunks: 4, completedChunks: 4}
// cleaning-dashboard.component.ts:955 Already loading a chunk, skipping
// cleaning.service.ts:231 Job 8 progress: {currentChunk: 4, totalChunks: 4, completedChunks: 4}
// cleaning-dashboard.component.ts:955 Already loading a chunk, skipping
// cleaning.service.ts:191 Received chunk 0 with 50 records
// cleaning-dashboard.component.ts:966 Loaded chunk 0: 50 records

// // browser network tab
// styles.css	304	stylesheet	Other	0.1 kB	2 ms
// jobs	204	preflight	Preflight
// 0.0 kB	2 ms
// jobs	201	xhr	cleaning-dashboard.component.ts:848	0.3 kB	9 ms
// progress	200	xhr	cleaning-dashboard.component.ts:880	188 kB	36 ms
// progress	200	xhr	cleaning-dashboard.component.ts:880	188 kB	126 ms
// progress	200	xhr	cleaning-dashboard.component.ts:880	188 kB	144 ms
// progress	200	xhr	cleaning-dashboard.component.ts:880	188 kB	164 ms
// 0	200	xhr	cleaning-dashboard.component.ts:964	0.3 kB	121 ms

// Look at the existing files (cleaningDashboardComponent, and the two other related ones) super carefully and update it accordingly so that there is no modification left for me. Give me the fully updated working file. fix all the mismatches and incosistencies in the variables methods and so on. For instance, the loading variable is two different types and each is conflicting with on another. maybe that is one of the source of issue. You must fix all such things. make sure whatever you do 100% aligns and works with the two other related existing files (chunking and review) hand in hand.

// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { merge, Subject, Subscription, timer } from 'rxjs';
// import { switchMap, filter, take, takeUntil, tap } from 'rxjs/operators';

// import {
//   CleaningResult,
//   CleaningSettings,
//   DataLoadEvent,
//   JobProgress,
// } from 'apps/ui/src/app/core/models/data.models';
// import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

// @Component({
//   selector: 'app-cleaning-dashboard',
//   template: `
//     <div class="dashboard-container">
//       <app-settings-panel
//         (settingsChanged)="onSettings($event)"
//       ></app-settings-panel>
//       <app-data-input (dataLoaded)="startCleaning($event)"></app-data-input>

//       <ng-container *ngIf="jobIds?.length && !allChunksCompleted">
//         <app-chunk-processor
//           [jobId]="currentJobId"
//           [currentChunkIndex]="currentChunkIndex"
//           [totalChunks]="totalChunks"
//           [currentChunk]="currentRecords"
//           (completed)="onChunkComplete($event)"
//           (previousChunk)="onPreviousChunk()"
//           (nextChunk)="onNextChunk()"
//         ></app-chunk-processor>

//         <div class="global-progress">
//           <mat-progress-bar
//             mode="determinate"
//             [value]="(processedChunks / totalChunks) * 100"
//           ></mat-progress-bar>
//           <span class="progress-text">
//             Processed {{ processedChunks }} of {{ totalChunks }} chunks
//             (Current: {{ currentChunkIndex + 1 }})
//           </span>
//         </div>
//       </ng-container>

//       <!-- Show when all chunks are completed but before navigation -->
//       <div
//         *ngIf="allChunksCompleted && !navigatingToResults"
//         class="completion-message"
//       >
//         <h3>All chunks processed successfully!</h3>
//         <p>Preparing results...</p>
//         <mat-spinner diameter="30"></mat-spinner>
//       </div>
//     </div>
//   `,
//   standalone: false,
// })
// export class CleaningDashboardComponent {
//   private destroy$ = new Subject<void>();
//   jobIds: string[] = [];
//   currentChunkIndex = 0;
//   totalChunks = 0;
//   processedChunks = 0;
//   currentJobId!: string;
//   currentRecords: CleaningResult[] = [];
//   allChunksCompleted = false;
//   navigatingToResults = false;
//   availableChunks: Set<number> = new Set();
//   processedChunkIndices: Set<number> = new Set();
//   isLoadingChunk = false;

//   private currentJobSubscriptions: Subscription[] = [];
//   private chunkStatus: boolean[] = [];

//   settings: CleaningSettings = {
//     autoCorrectAuthors: true,
//     validateCoordinates: true,
//     resolveTaxonomy: true,
//     chunkSize: 50,
//     confidenceThreshold: 0.8,
//     currentSource: 'symbiota2',
//     inputMethod: ['file-upload', 'text-input'],
//   };
//   isLoading: boolean = false;

//   constructor(
//     private cleaningService: CleaningService,
//     private router: Router
//   ) {}

//   onSettings(settings: CleaningSettings) {
//     this.settings = { ...this.settings, ...settings };
//   }

//   startCleaning(event: DataLoadEvent) {
//     // Reset state
//     this.allChunksCompleted = false;
//     this.navigatingToResults = false;
//     this.availableChunks.clear();
//     this.processedChunkIndices.clear();
//     this.currentRecords = [];
//     this.isLoadingChunk = false;

//     this.cleaningService
//       .startCleaningSession(event.data, this.settings)
//       .subscribe(({ jobIds, totalChunks }) => {
//         console.log('Jobs created:', { jobIds, totalChunks });
//         this.jobIds = jobIds;
//         this.totalChunks = totalChunks;
//         this.currentChunkIndex = 0;
//         this.processedChunks = 0;
//         this.currentJobId = jobIds[0]; // Use first job ID as primary
//         this.pollForAllJobs(); // Start polling all jobs
//       });
//   }

//   private pollForAllJobs() {
//     // Combine all job progress streams
//     const jobProgress$ = this.jobIds.map((jobId, chunkIndex) =>
//       timer(0, 1500).pipe(
//         switchMap(() => this.cleaningService.getJobProgress(jobId)),
//         filter((progress) => progress.chunks[0] !== null), // Wait until chunk is ready
//         take(1), // Complete after first successful response
//         tap(() => {
//           this.availableChunks.add(chunkIndex);
//           this.checkAvailableChunks();
//         })
//       )
//     );

//     merge(...jobProgress$)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe();
//   }

//   private checkAvailableChunks() {
//     const sortedChunks = Array.from(this.availableChunks).sort((a, b) => a - b);
//     const nextChunk = sortedChunks.find(
//       (idx) =>
//         !this.processedChunkIndices.has(idx) && idx === this.processedChunks
//     );

//     if (nextChunk !== undefined) {
//       this.loadSpecificChunk(nextChunk);
//     }
//   }

//   private updateProgress(progress: JobProgress) {
//     // Replace with lighter weight checks
//     this.processedChunks = this.processedChunkIndices.size;

//     if (this.processedChunks === this.totalChunks) {
//       this.navigateToResults();
//     }
//   }

//   private loadSpecificChunk(chunkIndex: number) {
//     if (this.isLoading) return; // Add loading lock
//     this.isLoading = true;

//     const jobId = this.jobIds[chunkIndex]; // Correct job ID for this chunk
//     console.log(`Loading chunk ${chunkIndex} from job ${jobId}`);

//     this.cleaningService.getChunk(jobId, 0).subscribe({
//       // Always get first chunk from job
//       next: (chunk) => {
//         this.currentRecords = chunk;
//         this.currentChunkIndex = chunkIndex;
//         this.isLoading = false;
//       },
//       error: () => (this.isLoading = false),
//     });
//   }

//   onChunkComplete(corrections: CleaningResult[]) {
//     const jobId = this.jobIds[this.currentChunkIndex] || this.currentJobId;
//     const idx = this.currentChunkIndex;

//     console.log(`Saving corrections for chunk ${idx}`);

//     this.cleaningService.approveChunk(jobId, idx, corrections).subscribe({
//       next: () => {
//         console.log(`Chunk ${idx} corrections saved successfully`);

//         // Mark this chunk as processed by user
//         this.processedChunkIndices.add(idx);

//         // Move to next available chunk
//         this.moveToNextChunk();
//       },
//       error: (err) => {
//         console.error(`Error saving chunk ${idx}:`, err);
//       },
//     });
//   }

//   private moveToNextChunk() {
//     // Find next unprocessed but available chunk
//     const unprocessedAvailable = Array.from(this.availableChunks).filter(
//       (index) => !this.processedChunkIndices.has(index)
//     );

//     console.log('Unprocessed available chunks:', unprocessedAvailable);

//     if (unprocessedAvailable.length > 0) {
//       // Load next available unprocessed chunk
//       const nextChunk = unprocessedAvailable[0];
//       this.loadSpecificChunk(nextChunk);
//     } else {
//       // No more chunks to process, check if we should navigate to results
//       console.log('No more chunks to process');
//       this.currentRecords = []; // Clear current records
//       if (this.processedChunkIndices.size >= this.totalChunks) {
//         this.allChunksCompleted = true;
//         setTimeout(() => this.navigateToResults(), 1500);
//       }
//     }
//   }

//   onPreviousChunk() {
//     if (this.isLoadingChunk) return;

//     const availableIndices = Array.from(this.availableChunks).sort(
//       (a, b) => a - b
//     );
//     const currentPos = availableIndices.indexOf(this.currentChunkIndex);
//     if (currentPos > 0) {
//       this.loadSpecificChunk(availableIndices[currentPos - 1]);
//     }
//   }

//   onNextChunk() {
//     if (this.isLoadingChunk) return;

//     const availableIndices = Array.from(this.availableChunks).sort(
//       (a, b) => a - b
//     );
//     const currentPos = availableIndices.indexOf(this.currentChunkIndex);
//     if (currentPos < availableIndices.length - 1) {
//       this.loadSpecificChunk(availableIndices[currentPos + 1]);
//     }
//   }

//   private navigateToResults() {
//     this.navigatingToResults = true;
//     this.destroy$.next();

//     // Ensure we pass the job data correctly
//     this.router.navigate(['/results'], {
//       state: {
//         jobIds: this.jobIds,
//         primaryJobId: this.currentJobId,
//         totalChunks: this.totalChunks,
//       },
//     });
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
// -----------------------
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import {
//   AuthorSuggestion,
//   CleaningChunk,
//   CleaningResult,
//   CoordSuggestion,
//   isTaxonSuggestion,
//   TaxonRecord,
//   TaxonSuggestion,
// } from 'apps/ui/src/app/core/models/data.models';
// import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';

// @Component({
//   selector: 'app-chunk-processor',
//   template: `
//     <div class="chunk-processor">
//       <div class="chunk-header">
//         <h3>Review Chunk {{ currentChunkIndex + 1 }} of {{ totalChunks }}</h3>
//         <div class="chunk-navigation">
//           <button
//             mat-icon-button
//             (click)="previousChunk.emit()"
//             [disabled]="currentChunkIndex === 0"
//             title="Previous chunk"
//           >
//             <mat-icon>chevron_left</mat-icon>
//           </button>
//           <span class="chunk-info">{{ currentRecords.length }} records</span>
//           <button
//             mat-icon-button
//             (click)="nextChunk.emit()"
//             [disabled]="currentChunkIndex >= totalChunks - 1"
//             title="Next chunk"
//           >
//             <mat-icon>chevron_right</mat-icon>
//           </button>
//         </div>
//       </div>

//       <div *ngIf="currentRecords.length === 0" class="loading-message">
//         <mat-spinner diameter="30"></mat-spinner>
//         <p>Loading chunk data...</p>
//       </div>

//       <div *ngIf="currentRecords.length > 0" class="chunk-content">
//         <!-- Summary Stats -->
//         <div class="chunk-stats">
//           <div class="stat-item">
//             <span class="stat-label">Total Records:</span>
//             <span class="stat-value">{{ currentRecords.length }}</span>
//           </div>
//           <div class="stat-item">
//             <span class="stat-label">Issues Found:</span>
//             <span class="stat-value">{{ getTotalIssues() }}</span>
//           </div>
//           <div class="stat-item">
//             <span class="stat-label">Suggestions:</span>
//             <span class="stat-value">{{ getTotalSuggestions() }}</span>
//           </div>
//         </div>

//         <!-- Records List -->
//         <div class="records-container">
//           <div
//             class="record-card"
//             *ngFor="let record of currentRecords; let i = index"
//             [class.has-issues]="record.issues && record.issues.length > 0"
//           >
//             <div class="record-header">
//               <span class="record-number">Record {{ i + 1 }}</span>
//               <span
//                 *ngIf="record.issues && record.issues.length > 0"
//                 class="issue-count"
//               >
//                 {{ record.issues.length }} issue(s)
//               </span>
//             </div>

//             <!-- Original vs Accepted side by side -->
//             <div class="record-comparison">
//               <div class="original-data">
//                 <h4>Original</h4>
//                 <div class="field-group">
//                   <div class="field">
//                     <label>Scientific Name:</label>
//                     <span>{{ record.original.scientificName }}</span>
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="record.original.scientificNameAuthorship"
//                   >
//                     <label>Authorship:</label>
//                     <span>{{ record.original.scientificNameAuthorship }}</span>
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="record.original.decimalLatitude !== null"
//                   >
//                     <label>Coordinates:</label>
//                     <span
//                       >{{ record.original.decimalLatitude }},
//                       {{ record.original.decimalLongitude }}</span
//                     >
//                   </div>
//                   <div class="field" *ngIf="record.original.family">
//                     <label>Family:</label>
//                     <span>{{ record.original.family }}</span>
//                   </div>
//                 </div>
//               </div>

//               <div class="accepted-data">
//                 <h4>Cleaned/Accepted</h4>
//                 <div class="field-group">
//                   <div class="field">
//                     <label>Scientific Name:</label>
//                     <input
//                       type="text"
//                       [(ngModel)]="record.accepted.scientificName"
//                       (ngModelChange)="onRecordChange(i)"
//                       class="editable-field"
//                     />
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="
//                       record.accepted.scientificNameAuthorship ||
//                       record.original.scientificNameAuthorship
//                     "
//                   >
//                     <label>Authorship:</label>
//                     <input
//                       type="text"
//                       [(ngModel)]="record.accepted.scientificNameAuthorship"
//                       (ngModelChange)="onRecordChange(i)"
//                       class="editable-field"
//                     />
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="
//                       record.accepted.decimalLatitude !== null ||
//                       record.original.decimalLatitude !== null
//                     "
//                   >
//                     <label>Latitude:</label>
//                     <input
//                       type="number"
//                       [(ngModel)]="record.accepted.decimalLatitude"
//                       (ngModelChange)="onRecordChange(i)"
//                       class="editable-field coordinate-input"
//                       step="any"
//                     />
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="
//                       record.accepted.decimalLongitude !== null ||
//                       record.original.decimalLongitude !== null
//                     "
//                   >
//                     <label>Longitude:</label>
//                     <input
//                       type="number"
//                       [(ngModel)]="record.accepted.decimalLongitude"
//                       (ngModelChange)="onRecordChange(i)"
//                       class="editable-field coordinate-input"
//                       step="any"
//                     />
//                   </div>
//                   <div
//                     class="field"
//                     *ngIf="record.accepted.family || record.original.family"
//                   >
//                     <label>Family:</label>
//                     <input
//                       type="text"
//                       [(ngModel)]="record.accepted.family"
//                       (ngModelChange)="onRecordChange(i)"
//                       class="editable-field"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <!-- Issues -->
//             <div
//               *ngIf="record.issues && record.issues.length > 0"
//               class="issues-section"
//             >
//               <h5>Issues Found:</h5>
//               <div class="issue-list">
//                 <div
//                   *ngFor="let issue of record.issues"
//                   class="issue-item"
//                   [class]="'issue-' + issue.type"
//                 >
//                   <mat-icon class="issue-icon">
//                     {{ getIssueIcon(issue.type) }}
//                   </mat-icon>
//                   <span>{{ issue.message }}</span>
//                 </div>
//               </div>
//             </div>

//             <!-- Suggestions -->
//             <div
//               *ngIf="record.suggestions && record.suggestions.length > 0"
//               class="suggestions-section"
//             >
//               <h5>Available Suggestions:</h5>
//               <div class="suggestion-list">
//                 <div
//                   *ngFor="let suggestion of record.suggestions"
//                   class="suggestion-item"
//                   (click)="applySuggestion(i, suggestion)"
//                 >
//                   <div class="suggestion-content">
//                     <span class="suggestion-type"
//                       >{{ getSuggestionType(suggestion) }}:</span
//                     >
//                     <span class="suggestion-value">{{
//                       getSuggestionValue(suggestion)
//                     }}</span>
//                   </div>
//                   <button mat-mini-fab color="primary" class="apply-btn">
//                     <mat-icon>check</mat-icon>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Chunk Actions -->
//         <div class="chunk-actions">
//           <button
//             mat-raised-button
//             color="primary"
//             (click)="confirmAndContinue()"
//             [disabled]="hasValidationErrors()"
//           >
//             <mat-icon>check</mat-icon>
//             Confirm & Continue
//           </button>

//           <button mat-button (click)="resetChunk()">
//             <mat-icon>refresh</mat-icon>
//             Reset to Original
//           </button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [
//     `
//       .chunk-processor {
//         max-width: 1200px;
//         margin: 0 auto;
//         padding: 20px;
//       }

//       .chunk-header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 20px;
//         padding-bottom: 10px;
//         border-bottom: 1px solid #ddd;
//       }

//       .chunk-navigation {
//         display: flex;
//         align-items: center;
//         gap: 10px;
//       }

//       .chunk-stats {
//         display: flex;
//         gap: 20px;
//         margin-bottom: 20px;
//         padding: 15px;
//         background: #f5f5f5;
//         border-radius: 5px;
//       }

//       .stat-item {
//         display: flex;
//         flex-direction: column;
//       }

//       .stat-label {
//         font-size: 12px;
//         color: #666;
//       }

//       .stat-value {
//         font-size: 18px;
//         font-weight: bold;
//         color: #333;
//       }

//       .records-container {
//         max-height: 600px;
//         overflow-y: auto;
//         border: 1px solid #ddd;
//         border-radius: 5px;
//       }

//       .record-card {
//         border-bottom: 1px solid #eee;
//         padding: 15px;
//       }

//       .record-card.has-issues {
//         border-left: 4px solid #ff9800;
//         background: #fff8e1;
//       }

//       .record-header {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 10px;
//       }

//       .record-number {
//         font-weight: bold;
//         color: #333;
//       }

//       .issue-count {
//         background: #ff9800;
//         color: white;
//         padding: 2px 8px;
//         border-radius: 10px;
//         font-size: 12px;
//       }

//       .record-comparison {
//         display: grid;
//         grid-template-columns: 1fr 1fr;
//         gap: 20px;
//         margin-bottom: 15px;
//       }

//       .field-group {
//         display: flex;
//         flex-direction: column;
//         gap: 8px;
//       }

//       .field {
//         display: flex;
//         flex-direction: column;
//         gap: 4px;
//       }

//       .field label {
//         font-size: 12px;
//         color: #666;
//         font-weight: 500;
//       }

//       .editable-field {
//         padding: 8px;
//         border: 1px solid #ddd;
//         border-radius: 4px;
//         font-size: 14px;
//       }

//       .editable-field:focus {
//         outline: none;
//         border-color: #2196f3;
//         box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
//       }

//       .coordinate-input {
//         max-width: 120px;
//       }

//       .issues-section,
//       .suggestions-section {
//         margin-top: 15px;
//         padding-top: 15px;
//         border-top: 1px solid #eee;
//       }

//       .issues-section h5,
//       .suggestions-section h5 {
//         margin: 0 0 10px 0;
//         color: #333;
//       }

//       .issue-list {
//         display: flex;
//         flex-direction: column;
//         gap: 5px;
//       }

//       .issue-item {
//         display: flex;
//         align-items: center;
//         gap: 8px;
//         padding: 5px;
//         border-radius: 4px;
//       }

//       .issue-error {
//         background: #ffebee;
//         color: #c62828;
//       }

//       .issue-warning {
//         background: #fff8e1;
//         color: #ef6c00;
//       }

//       .issue-icon {
//         font-size: 16px;
//         width: 16px;
//         height: 16px;
//       }

//       .suggestion-list {
//         display: flex;
//         flex-direction: column;
//         gap: 8px;
//       }

//       .suggestion-item {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         padding: 10px;
//         background: #e8f5e8;
//         border-radius: 4px;
//         cursor: pointer;
//         transition: background-color 0.2s;
//       }

//       .suggestion-item:hover {
//         background: #d4edda;
//       }

//       .suggestion-content {
//         display: flex;
//         flex-direction: column;
//         gap: 2px;
//       }

//       .suggestion-type {
//         font-size: 12px;
//         color: #666;
//         font-weight: 500;
//       }

//       .suggestion-value {
//         font-size: 14px;
//         color: #333;
//       }

//       .apply-btn {
//         transform: scale(0.8);
//       }

//       .chunk-actions {
//         display: flex;
//         gap: 15px;
//         justify-content: center;
//         margin-top: 20px;
//         padding-top: 20px;
//         border-top: 1px solid #ddd;
//       }

//       .loading-message {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         padding: 40px;
//         color: #666;
//       }
//     `,
//   ],
//   standalone: false,
// })
// export class ChunkProcessorComponent {
//   @Input() jobId!: string;
//   @Input() currentChunkIndex!: number;
//   @Input() totalChunks!: number;
//   @Input() currentChunk: CleaningResult[] = [];

//   @Output() completed = new EventEmitter<CleaningResult[]>();
//   @Output() previousChunk = new EventEmitter<void>();
//   @Output() nextChunk = new EventEmitter<void>();

//   // Make a local copy to avoid modifying the input directly
//   get currentRecords(): CleaningResult[] {
//     return this.currentChunk.map(
//       (record) =>
//         ({
//           ...record,
//           accepted: record.accepted || { ...record.original },
//         } as CleaningResult)
//     );
//   }

//   constructor(private cleaningService: CleaningService) {}

//   onRecordChange(index: number) {
//     // This method is called when user edits a field
//     // The two-way binding will automatically update the record
//     console.log(`Record ${index} changed`);
//   }

//   getTotalIssues(): number {
//     return this.currentRecords.reduce(
//       (total, record) => total + (record.issues?.length || 0),
//       0
//     );
//   }

//   getTotalSuggestions(): number {
//     return this.currentRecords.reduce(
//       (total, record) => total + (record.suggestions?.length || 0),
//       0
//     );
//   }

//   getIssueIcon(type: string): string {
//     switch (type) {
//       case 'error':
//         return 'error';
//       case 'warning':
//         return 'warning';
//       default:
//         return 'info';
//     }
//   }

//   getSuggestionType(suggestion: any): string {
//     switch (suggestion.type) {
//       case 'taxon':
//         return 'Taxon';
//       case 'author':
//         return 'Author';
//       case 'coordinate':
//         return 'Coordinate';
//       default:
//         return 'Unknown';
//     }
//   }

//   getSuggestionValue(suggestion: any): string {
//     switch (suggestion.type) {
//       case 'taxon':
//         return suggestion.acceptedName || suggestion.scientificName;
//       case 'author':
//         return suggestion.correctedAuthor;
//       case 'coordinate':
//         return `${suggestion.suggestedLat}, ${suggestion.suggestedLng}`;
//       default:
//         return 'N/A';
//     }
//   }

//   applySuggestion(recordIndex: number, suggestion: any) {
//     const record = this.currentRecords[recordIndex];

//     if (!record.accepted) {
//       record.accepted = { ...record.original };
//     }

//     switch (suggestion.type) {
//       case 'taxon':
//         if (suggestion.acceptedName) {
//           record.accepted.scientificName = suggestion.acceptedName;
//         } else if (suggestion.scientificName) {
//           record.accepted.scientificName = suggestion.scientificName;
//         }
//         if (suggestion.family) record.accepted.family = suggestion.family;
//         if (suggestion.genus) record.accepted.genus = suggestion.genus;
//         break;

//       case 'author':
//         record.accepted.scientificNameAuthorship = suggestion.correctedAuthor;
//         break;

//       case 'coordinate':
//         record.accepted.decimalLatitude = suggestion.suggestedLat;
//         record.accepted.decimalLongitude = suggestion.suggestedLng;
//         break;
//     }

//     console.log(`Applied suggestion to record ${recordIndex}:`, suggestion);
//   }

//   confirmAndContinue() {
//     if (this.hasValidationErrors()) {
//       console.warn('Cannot continue with validation errors');
//       return;
//     }

//     console.log('Confirming chunk with records:', this.currentRecords.length);
//     this.completed.emit([...this.currentRecords]);
//   }

//   resetChunk() {
//     // Reset all accepted values to original values
//     this.currentRecords.forEach((record) => {
//       record.accepted = { ...record.original };
//     });
//     console.log('Chunk reset to original values');
//   }

//   hasValidationErrors(): boolean {
//     // Check for basic validation errors
//     return this.currentRecords.some((record) => {
//       const accepted = record.accepted as TaxonRecord;

//       if (!accepted.decimalLatitude || !accepted.decimalLongitude) return false;

//       return (
//         !accepted.scientificName ||
//         accepted.scientificName.trim().length === 0 ||
//         accepted.decimalLatitude < -90 ||
//         accepted.decimalLatitude > 90 ||
//         accepted.decimalLongitude < -180 ||
//         accepted.decimalLongitude > 180
//       );
//     });
//   }
// }
// --------------------
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { CleaningService } from 'apps/ui/src/app/core/services/cleaning.service';
// import {
//   CleaningResult,
//   JobProgress,
// } from 'apps/ui/src/app/core/models/data.models';

// @Component({
//   selector: 'app-results-review',
//   template: `
//     <div class="review-container">
//       <h2>Cleaning Results Summary</h2>

//       <div *ngIf="loading" class="loading-overlay">
//         <mat-spinner diameter="50"></mat-spinner>
//         <p>Loading results...</p>
//       </div>

//       <ng-container *ngIf="!loading && progress">
//         <!-- Summary Statistics -->
//         <div class="stats-grid">
//           <div class="stat-card">
//             <div class="stat-icon">
//               <mat-icon>assignment</mat-icon>
//             </div>
//             <div class="stat-content">
//               <h3>{{ totalRecords }}</h3>
//               <p>Total Records</p>
//             </div>
//           </div>

//           <div class="stat-card issues">
//             <div class="stat-icon">
//               <mat-icon>warning</mat-icon>
//             </div>
//             <div class="stat-content">
//               <h3>{{ totalIssues }}</h3>
//               <p>Issues Found</p>
//             </div>
//           </div>

//           <div class="stat-card corrections">
//             <div class="stat-icon">
//               <mat-icon>auto_fix_high</mat-icon>
//             </div>
//             <div class="stat-content">
//               <h3>{{ autoCorrected }}</h3>
//               <p>Auto-Corrected</p>
//             </div>
//           </div>

//           <div class="stat-card chunks">
//             <div class="stat-icon">
//               <mat-icon>view_module</mat-icon>
//             </div>
//             <div class="stat-content">
//               <h3>{{ totalChunks }}</h3>
//               <p>Chunks Processed</p>
//             </div>
//           </div>
//         </div>

//         <!-- Chunk Navigation -->
//         <div class="chunk-navigation">
//           <button
//             mat-icon-button
//             (click)="previousChunk()"
//             [disabled]="currentChunkIndex === 0"
//             title="Previous chunk"
//           >
//             <mat-icon>chevron_left</mat-icon>
//           </button>

//           <div class="chunk-info">
//             <span>Chunk {{ currentChunkIndex + 1 }} of {{ totalChunks }}</span>
//             <span class="chunk-size">({{ currentChunk.length }} records)</span>
//           </div>

//           <button
//             mat-icon-button
//             (click)="nextChunk()"
//             [disabled]="currentChunkIndex === totalChunks - 1"
//             title="Next chunk"
//           >
//             <mat-icon>chevron_right</mat-icon>
//           </button>
//         </div>

//         <!-- Current Chunk Display -->
//         <div class="chunk-display">
//           <div
//             *ngIf="currentChunk && currentChunk.length > 0"
//             class="records-list"
//           >
//             <div class="records-header">
//               <h3>Chunk {{ currentChunkIndex + 1 }} Records</h3>
//               <div class="chunk-stats">
//                 <span class="stat">{{ getChunkIssues() }} issues</span>
//                 <span class="stat">{{ getChunkCorrections() }} corrected</span>
//               </div>
//             </div>

//             <div class="records-container">
//               <div
//                 class="record-summary"
//                 *ngFor="let record of currentChunk; let i = index"
//                 [class.has-issues]="record.issues && record.issues.length > 0"
//                 [class.has-corrections]="hasCorrections(record)"
//               >
//                 <div class="record-header">
//                   <span class="record-number">{{ i + 1 }}</span>
//                   <div class="record-badges">
//                     <span
//                       *ngIf="record.issues && record.issues.length > 0"
//                       class="badge issues-badge"
//                     >
//                       {{ record.issues.length }} issue{{
//                         record.issues.length > 1 ? 's' : ''
//                       }}
//                     </span>
//                     <span
//                       *ngIf="hasCorrections(record)"
//                       class="badge corrections-badge"
//                     >
//                       Corrected
//                     </span>
//                   </div>
//                 </div>

//                 <div class="record-content">
//                   <div class="name-comparison">
//                     <div class="original">
//                       <label>Original:</label>
//                       <span>{{ record.original.scientificName }}</span>
//                       <span
//                         *ngIf="record.original.scientificNameAuthorship"
//                         class="author"
//                       >
//                         {{ record.original.scientificNameAuthorship }}
//                       </span>
//                     </div>

//                     <div class="accepted" *ngIf="hasCorrections(record)">
//                       <label>Cleaned:</label>
//                       <span>{{
//                         record.accepted?.scientificName ||
//                           record.original.scientificName
//                       }}</span>
//                       <span
//                         *ngIf="record.accepted?.scientificNameAuthorship"
//                         class="author"
//                       >
//                         {{ record?.accepted?.scientificNameAuthorship }}
//                       </span>
//                     </div>
//                   </div>

//                   <div
//                     *ngIf="record.issues && record.issues.length > 0"
//                     class="issues-summary"
//                   >
//                     <span class="issues-label">Issues:</span>
//                     <span class="issues-text">
//                       {{ getIssueMessages(record.issues) }}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div
//             *ngIf="currentChunk && currentChunk.length === 0"
//             class="empty-chunk"
//           >
//             <mat-icon>info</mat-icon>
//             <p>No records in this chunk.</p>
//           </div>
//         </div>

//         <!-- Action Buttons -->
//         <div class="final-actions">
//           <button
//             mat-raised-button
//             color="primary"
//             (click)="downloadResults()"
//             class="download-btn"
//           >
//             <mat-icon>download</mat-icon>
//             Download Cleaned Data
//           </button>

//           <button
//             mat-raised-button
//             color="accent"
//             (click)="saveResults()"
//             class="save-btn"
//           >
//             <mat-icon>save</mat-icon>
//             Save Results
//           </button>

//           <button
//             mat-button
//             (click)="startNewSession()"
//             class="new-session-btn"
//           >
//             <mat-icon>refresh</mat-icon>
//             New Cleaning Session
//           </button>
//         </div>
//       </ng-container>

//       <div *ngIf="!loading && !progress" class="error-message">
//         <mat-icon>error</mat-icon>
//         <h3>Unable to load results</h3>
//         <p>
//           There was an error loading the cleaning results. Please try again.
//         </p>
//         <button mat-raised-button color="primary" (click)="retryLoad()">
//           <mat-icon>refresh</mat-icon>
//           Retry
//         </button>
//         <button mat-button (click)="startNewSession()">
//           Back to Dashboard
//         </button>
//       </div>
//     </div>
//   `,
//   ],
//   standalone: false,
// })
// export class ResultsReviewComponent implements OnInit {
//   totalRecords = 0;
//   totalIssues = 0;
//   autoCorrected = 0;
//   currentChunkIndex = 0;
//   totalChunks = 0;

//   progress: JobProgress | null = null;
//   currentChunk: CleaningResult[] = [];
//   jobIds: string[] = [];
//   primaryJobId: string | null = null;
//   loading = true;

//   constructor(
//     private cleaningService: CleaningService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     // Get job information from router state
//     const nav = this.router.getCurrentNavigation();
//     const state = nav?.extras?.state || history.state;

//     this.primaryJobId = state?.['primaryJobId'] || state?.['jobId'] || null;
//     this.jobIds =
//       state?.['jobIds'] || (this.primaryJobId ? [this.primaryJobId] : []);

//     console.log('Results component initialized with:', {
//       primaryJobId: this.primaryJobId,
//       jobIds: this.jobIds,
//     });

//     if (!this.primaryJobId) {
//       console.error('No job ID found, redirecting to dashboard');
//       this.router.navigate(['/']);
//       return;
//     }

//     this.fetchResults();
//   }

//   fetchResults() {
//     this.loading = true;
//     this.cleaningService.getJobProgress(this.primaryJobId!).subscribe({
//       next: (progress) => {
//         console.log('Fetched results progress:', progress);
//         this.progress = progress;
//         this.totalChunks = progress.totalChunks;
//         this.currentChunkIndex = 0;
//         this.updateStatsAndChunk();
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error fetching results:', error);
//         this.loading = false;
//         this.progress = null;
//       },
//     });
//   }

//   updateStatsAndChunk() {
//     if (!this.progress) return;

//     // Get all completed chunks and flatten them
//     const allRecords = (this.progress.chunks || [])
//       .filter((chunk) => chunk !== null && Array.isArray(chunk))
//       .flat() as CleaningResult[];

//     console.log('Processing stats for', allRecords.length, 'total records');

//     this.totalRecords = allRecords.length;
//     this.totalIssues = allRecords.reduce(
//       (sum, rec) => sum + (rec.issues?.length || 0),
//       0
//     );
//     this.autoCorrected = allRecords.filter((rec) =>
//       this.hasCorrections(rec)
//     ).length;

//     // Update current chunk - ensure it's valid
//     const chunkData = this.progress.chunks?.[this.currentChunkIndex];
//     this.currentChunk = (
//       Array.isArray(chunkData) ? chunkData : []
//     ) as CleaningResult[];

//     console.log(
//       'Current chunk',
//       this.currentChunkIndex,
//       'has',
//       this.currentChunk.length,
//       'records'
//     );
//   }

//   hasCorrections(record: CleaningResult): boolean {
//     if (!record.accepted) return false;

//     const original = record.original;
//     const accepted = record.accepted;

//     return (
//       original.scientificName !== accepted.scientificName ||
//       original.scientificNameAuthorship !== accepted.scientificNameAuthorship ||
//       original.decimalLatitude !== accepted.decimalLatitude ||
//       original.decimalLongitude !== accepted.decimalLongitude ||
//       original.family !== accepted.family
//     );
//   }

//   getIssueMessages(issues: any[]): string {
//     return issues?.map((issue) => issue.message).join(', ') || '';
//   }

//   getChunkIssues(): number {
//     return this.currentChunk.reduce(
//       (total, record) => total + (record.issues?.length || 0),
//       0
//     );
//   }

//   getChunkCorrections(): number {
//     return this.currentChunk.filter((record) => this.hasCorrections(record))
//       .length;
//   }

//   previousChunk() {
//     if (this.currentChunkIndex > 0) {
//       this.currentChunkIndex--;
//       this.updateStatsAndChunk();
//     }
//   }

//   nextChunk() {
//     if (this.currentChunkIndex < this.totalChunks - 1) {
//       this.currentChunkIndex++;
//       this.updateStatsAndChunk();
//     }
//   }

//   downloadResults(): void {
//     if (!this.progress) return;

//     // Collect all records from all chunks
//     const allRecords = (this.progress.chunks || [])
//       .filter((chunk) => chunk !== null && Array.isArray(chunk))
//       .flat() as CleaningResult[];

//     // Create downloadable data with cleaned values
//     const cleanedData = allRecords.map((record) => {
//       const cleanedRecord = { ...record.original };

//       // Apply corrections if they exist
//       if (record.accepted) {
//         Object.keys(record.accepted).forEach((key) => {
//           if (
//             record.accepted![key] !== undefined &&
//             record.accepted![key] !== null
//           ) {
//             cleanedRecord[key] = record.accepted![key];
//           }
//         });
//       }

//       // Add metadata about the cleaning process
//       cleanedRecord['_cleaning_metadata'] = {
//         issues_found: record.issues?.length || 0,
//         corrections_applied: this.hasCorrections(record),
//         suggestions_available: record.suggestions?.length || 0,
//         processed_at: new Date().toISOString(),
//       };

//       return cleanedRecord;
//     });

//     // Create and download file
//     const blob = new Blob([JSON.stringify(cleanedData, null, 2)], {
//       type: 'application/json',
//     });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `cleaned-taxon-data-${
//       new Date().toISOString().split('T')[0]
//     }.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);

//     console.log('Downloaded', cleanedData.length, 'cleaned records');
//   }

//   saveResults(): void {
//     // This could be implemented to save to a database or cloud storage
//     console.log('Save results functionality not yet implemented');
//     // For now, just show a message
//     alert(
//       'Save functionality will be implemented to store results in your preferred location.'
//     );
//   }

//   retryLoad(): void {
//     this.fetchResults();
//   }

//   startNewSession() {
//     this.router.navigate(['/']);
//   }
// }
