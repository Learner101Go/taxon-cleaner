import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export interface AppConfig {
  SYMBIOTA_API: string;
  REDIS_URL: string;
  CHUNK_SIZE: number;
  IPNI_ENDPOINT: string;
  COORDINATE_PRECISION: number;
}

export const configValidationSchema = Joi.object({
  REDIS_URL: Joi.string().uri().required(),
  CHUNK_SIZE: Joi.number().default(50),
  IPNI_ENDPOINT: Joi.string().uri().default('https://ipni.org/api/1'),
  COORDINATE_PRECISION: Joi.number().default(6),
});

export default registerAs(
  'app',
  (): AppConfig => ({
    SYMBIOTA_API: process.env.SYMBIOTA_API,
    REDIS_URL: process.env.REDIS_URL,
    CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE || '50', 10),
    IPNI_ENDPOINT: process.env.IPNI_ENDPOINT,
    COORDINATE_PRECISION: parseInt(process.env.COORDINATE_PRECISION || '6', 10),
  })
);
