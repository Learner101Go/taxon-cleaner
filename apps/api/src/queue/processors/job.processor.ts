// // src/queue/processors/job.processor.ts
// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { Job } from 'bullmq';
// import { JobResponseDto } from '../../jobs/dto/job-response.dto';
// import { ProcessingService } from '../../processing/taxon/processing.service';

// @Processor('cleaning')
// export class JobProcessor extends WorkerHost {
//   constructor(private processing: ProcessingService) {
//     super();
//   }

//   async process(job: Job<JobResponseDto>): Promise<any> {
//     const chunkResults = await Promise.all(
//       job.data.records.map((record) =>
//         this.processing.processRecord(record, job.data.source)
//       )
//     );

//     return {
//       jobId: job.id,
//       chunkIndex: job.data.chunkIndex,
//       results: chunkResults,
//     };
//   }
// }
