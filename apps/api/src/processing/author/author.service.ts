import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthorResult, CleaningResult } from '../../shared/types';

@Injectable()
export class AuthorService {
  private readonly IPNI_ENDPOINT = 'https://ipni.org/api/1';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async normalize(authorStr: string) {
    const cached = await this.cacheManager.get(authorStr);
    if (cached) return cached;

    const authors = this.splitAuthors(authorStr);
    const results = await Promise.all(
      authors.map((author) => this.queryIPNI(author))
    );

    await this.cacheManager.set(authorStr, results, 86400);
    return results;
  }

  private splitAuthors(input: string) {
    return input
      .split(/(?:,\s*|;\s*|\s+ex\s+|\s+&\s+|\s+et\s+al\.?)/gi)
      .filter((a) => a.trim().length > 0);
  }

  private async queryIPNI(author: string) {
    const { data } = await this.httpService
      .get(`${this.IPNI_ENDPOINT}/authors`, { params: { q: author } })
      .toPromise();
    return data.results;
  }
}
