import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { DataSettings, TaxonRecord } from '../../shared/types';
import { Type } from 'class-transformer';

// export class CreateJobDto {
//   data: any[];
//   source: string;
//   chunkSize?: number;
// }

// export class CreateJobResponseDto {
//   jobIds: string[]; // Changed from single ID to array
//   totalChunks: number;
// }

// export class CreateJobDto {
//   data!: TaxonRecord[];
//   settings!: DataSettings;
// }

// export class CreateJobDto {
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => DataSettings) // or a TaxonRecordDto if you make one
//   data: TaxonRecord[];

//   @ValidateNested()
//   @Type(() => DataSettings) // or a DataSettingsDto
//   settings: DataSettings;
// }

// export class CreateJobResponseDto {
//   jobIds: string[];
//   totalChunks: number;
// }
