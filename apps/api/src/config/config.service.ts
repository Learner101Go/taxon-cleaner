import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfig } from './configuration';

@Injectable()
export class ConfigService extends NestConfigService<AppConfig> {
  getCoordinatePrecision(): number {
    return this.get<number>('COORDINATE_PRECISION') || 6;
  }

  getChunkSize(): number {
    return this.get<number>('CHUNK_SIZE') || 50;
  }
}
