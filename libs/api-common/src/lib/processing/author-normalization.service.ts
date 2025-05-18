// import { Inject, Injectable } from '@nestjs/common';

// @Injectable()
// export class AuthorNormalizationService {
//   private readonly AUTHOR_CACHE_TTL = 86400; // 24 hours

//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private http: HttpService,
//     private config: ConfigService
//   ) {}

//   /**
//    * Advanced author processing with multiple fallback strategies
//    */
//   async processAuthorship(record: TaxonRecord): Promise<CleaningModuleResult> {
//     const rawAuthorship = record.scientificNameAuthorship || '';
//     const issues: DataIssue[] = [];
//     const suggestions: CleaningSuggestion[] = [];

//     // Step 1: Basic format validation
//     if (!this.validateAuthorFormat(rawAuthorship)) {
//       issues.push(this.createIssue('Invalid authorship format', 'error'));
//     }

//     // Step 2: IPNI lookup with cache
//     const ipniAuthors = await this.queryIPNIAuthors(rawAuthorship);

//     // Step 3: Local database lookup
//     const localMatches = await this.checkLocalCollections(rawAuthorship);

//     // Step 4: Combine and rank suggestions
//     const allSuggestions = [...ipniAuthors, ...localMatches];
//     const ranked = this.rankSuggestions(rawAuthorship, allSuggestions);

//     // Step 5: Generate standardized form
//     if (ranked.length > 0) {
//       suggestions.push({
//         type: 'author-normalization',
//         confidence: ranked[0].confidence,
//         value: this.formatStandardAuthor(ranked[0]),
//       });
//     }

//     return { issues, suggestions };
//   }

//   private async queryIPNIAuthors(
//     authorship: string
//   ): Promise<AuthorCandidate[]> {
//     const cacheKey = `author:ipni:${authorship}`;
//     const cached = await this.cacheManager.get<AuthorCandidate[]>(cacheKey);
//     if (cached) return cached;

//     try {
//       const response = await this.http
//         .get<IPNIResponse>(`${this.config.get('IPNI_ENDPOINT')}/authors`, {
//           params: { q: authorship },
//         })
//         .toPromise();

//       const results = response.data.results.map((result) => ({
//         fullName: `${result.forename} ${result.surname}`.trim(),
//         standardForm: this.formatIPNIAuthor(result),
//         confidence: this.calculateMatchConfidence(authorship, result),
//       }));

//       await this.cacheManager.set(cacheKey, results, this.AUTHOR_CACHE_TTL);
//       return results;
//     } catch (error) {
//       this.logger.error('IPNI query failed', error);
//       return [];
//     }
//   }

//   private formatIPNIAuthor(author: IPNIAuthor): string {
//     // Convert "Mary Elizabeth" to "M.E."
//     const initials = author.forename
//       .split(' ')
//       .map((n) => n[0] + '.')
//       .join(' ');
//     return `${initials} ${author.surname}`;
//   }
// }
