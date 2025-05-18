// // libs/core/src/lib/cache/cache-manager.service.ts

// import { Inject, Injectable } from '@nestjs/common';

// @Injectable()
// export class CacheManagerService {
//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private config: ConfigService
//   ) {}

//   async getOrSet<T>(
//     key: string,
//     factory: () => Promise<T>,
//     ttl?: number
//   ): Promise<T> {
//     const cached = await this.cacheManager.get<T>(key);
//     if (cached) return cached;

//     const value = await factory();
//     await this.cacheManager.set(
//       key,
//       value,
//       ttl || this.config.get('DEFAULT_CACHE_TTL')
//     );
//     return value;
//   }
// }
