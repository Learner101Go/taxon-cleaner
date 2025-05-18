// // libs/core/src/lib/processing/stream-processor.service.ts

// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class StreamProcessorService {
//   async processLargeFile(
//     filePath: string,
//     source: DataSource
//   ): Promise<ProcessingStats> {
//     const stream = fs
//       .createReadStream(filePath)
//       .pipe(JSONStream.parse('*'))
//       .pipe(
//         new Transform({
//           objectMode: true,
//           transform: async (record, encoding, callback) => {
//             try {
//               const result = await this.taxonProcessor.processRecord(
//                 record,
//                 source
//               );
//               this.saveToQueue(result);
//               callback();
//             } catch (error) {
//               callback(error);
//             }
//           },
//         })
//       );

//     return new Promise((resolve, reject) => {
//       stream.on('finish', () => resolve(this.stats));
//       stream.on('error', reject);
//     });
//   }
// }
