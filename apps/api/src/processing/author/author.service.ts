// import { Inject, Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { Cache } from 'cache-manager';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { AuthorResult, CleaningResult } from '../../shared/types';

// @Injectable()
// export class AuthorService {
//   private readonly IPNI_ENDPOINT = 'https://ipni.org/api/1';

//   constructor(
//     private readonly httpService: HttpService,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache
//   ) {}

//   async normalize(authorStr: string) {
//     const cached = await this.cacheManager.get(authorStr);
//     if (cached) return cached;

//     const authors = this.splitAuthors(authorStr);
//     const results = await Promise.all(
//       authors.map((author) => this.queryIPNI(author))
//     );

//     await this.cacheManager.set(authorStr, results, 86400);
//     return results;
//   }

//   private splitAuthors(input: string) {
//     return input
//       .split(/(?:,\s*|;\s*|\s+ex\s+|\s+&\s+|\s+et\s+al\.?)/gi)
//       .filter((a) => a.trim().length > 0);
//   }

//   private async queryIPNI(author: string) {
//     const { data } = await this.httpService
//       .get(`${this.IPNI_ENDPOINT}/authors`, { params: { q: author } })
//       .toPromise();
//     return data.results;
//   }
// }

/////////////////////////////////////////////////

// import { Inject, Injectable } from '@nestjs/common';
// import { IpniAuthor, PteridoAuthor } from '@taxon-cleaner/api-database';
// import {
//   AuthorResult,
//   AuthorSuggestion,
//   AuthorIssue,
// } from '../../shared/types';
// import { Repository } from 'typeorm';

// @Injectable()
// export class AuthorService {
//   constructor(
//     @Inject('IpniAuthorRepository')
//     private readonly ipniRepo: Repository<IpniAuthor>,

//     @Inject('PteridoAuthorRepository')
//     private readonly pteroRepo: Repository<PteridoAuthor>
//   ) {}

//   async normalize(author: string): Promise<AuthorResult> {
//     const issues: AuthorIssue[] = [];
//     const suggestions: AuthorSuggestion[] = [];

//     if (!author || author.trim().length === 0) {
//       issues.push({
//         type: 'warning',
//         message: 'Author field is empty',
//       });
//       return { issues, suggestions };
//     }

//     // Simple normalization rules
//     let normalized = author.trim();

//     // Check for common abbreviation issues
//     if (normalized.includes('.') && !normalized.endsWith('.')) {
//       issues.push({
//         type: 'warning',
//         message: 'Author abbreviation may be incomplete',
//       });
//     }

//     // Suggest normalized version if different
//     if (normalized !== author) {
//       suggestions.push({
//         type: 'author',
//         confidence: 0.9,
//         correctedAuthor: normalized,
//       });
//     }

//     // Add more sophisticated normalization logic here
//     // For now, this is a basic implementation

//     return { issues, suggestions };
//   }
// }

////////////////////////////////////////

import { Injectable, Inject } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { IpniAuthor, PteridoAuthor } from '@taxon-cleaner/api-database';
import {
  AuthorResult,
  AuthorSuggestion,
  AuthorIssue,
} from '../../shared/types';

@Injectable()
export class AuthorService {
  constructor(
    @Inject('IpniAuthorRepository')
    private readonly ipniRepo: Repository<IpniAuthor>,

    @Inject('PteridoAuthorRepository')
    private readonly pteroRepo: Repository<PteridoAuthor>
  ) {}

  /**
   * Given a raw “author” string (which may contain multiple names separated by commas,
   * “ex”, “&”, “et al.”, etc.), split it into individual components, look each up in
   * IPNI and Pterido tables, and return a list of AuthorResult entries.
   *
   * If you want to return a single aggregated result, you could flatten this array
   * in the controller. For clarity here, we return an array of per‐name results.
   */
  async normalizeAll(raw: string): Promise<AuthorResult[]> {
    // 1) Split into individual author tokens
    const parts = this.splitAuthors(raw);

    // 2) For each part, do a lookup in IPNI and Pterido
    const results = await Promise.all(
      parts.map((name) => this.normalizeSingle(name))
    );

    return results;
  }

  /**
   * Normalize one author name (e.g. "Linnaeus", "L.", "Smith", "Hook. & Grev.")
   * Look it up in both IPNI and Pterido tables to build issues/suggestions.
   */
  private async normalizeSingle(author: string): Promise<AuthorResult> {
    const issues: AuthorIssue[] = [];
    const suggestions: AuthorSuggestion[] = [];
    const trimmed = author.trim();

    // 1) If the entire string is empty, warn and return immediately
    if (!trimmed) {
      issues.push({
        type: 'warning',
        message: 'Author field is empty',
      });
      return {
        original: author,
        issues,
        suggestions,
      };
    }

    // 2) If it contains a dot but doesn't end with a dot, flag “incomplete abbreviation”
    if (/\./.test(trimmed) && !trimmed.endsWith('.')) {
      issues.push({
        type: 'warning',
        message: 'Author abbreviation may be incomplete (missing final “.”).',
      });
    }

    // 3) Look for exact or case‐insensitive match in IPNI’s author_name or standard_form
    const ipniMatches = await this.ipniRepo.find({
      where: [{ authorName: ILike(trimmed) }, { standardForm: ILike(trimmed) }],
      take: 5, // limit to top 5 suggestions
    });

    if (ipniMatches.length) {
      ipniMatches.forEach((ipni) => {
        suggestions.push({
          type: 'author',
          confidence: 1.0, // exact‐match in DB → highest confidence
          correctedAuthor: ipni.standardForm,
          source: 'ipni',
        });
      });
    }

    // 4) Look for any partial match (e.g. trimmed contained in author_name) for lower‐confidence suggestions
    if (ipniMatches.length === 0) {
      const ipniPartial = await this.ipniRepo.find({
        where: [
          { authorName: ILike(`%${trimmed}%`) },
          { standardForm: ILike(`%${trimmed}%`) },
        ],
        take: 5,
      });
      ipniPartial.forEach((ipni) => {
        suggestions.push({
          type: 'author',
          confidence: 0.7, // partial‐match → lower confidence
          correctedAuthor: ipni.standardForm,
          source: 'ipni',
        });
      });
    }

    // 5) Also check PteridoPortal’s author_name column
    const pteroMatches = await this.pteroRepo.find({
      where: { authorName: ILike(trimmed) },
      take: 5,
    });
    if (pteroMatches.length) {
      pteroMatches.forEach((p) => {
        suggestions.push({
          type: 'author',
          confidence: 1.0,
          correctedAuthor: p.authorName,
          source: 'pterido',
        });
      });
    }

    if (pteroMatches.length === 0) {
      const pteroPartial = await this.pteroRepo.find({
        where: { authorName: ILike(`%${trimmed}%`) },
        take: 5,
      });
      pteroPartial.forEach((p) => {
        suggestions.push({
          type: 'author',
          confidence: 0.7,
          correctedAuthor: p.authorName,
          source: 'pterido',
        });
      });
    }

    // 6) If no match was found in _either_ source, emit an “error” issue
    if (ipniMatches.length === 0 && pteroMatches.length === 0) {
      issues.push({
        type: 'error',
        message: `No match found for “${trimmed}” in IPNI or PteridoPortal.`,
      });
    }

    // 7) Finally, if the “trimmed” text itself is not exactly one of the “correctedAuthor”
    //    suggestions, you could recommend the top IPNI suggestion “standard_form” as “the new cleaned value.”
    //
    //    However, we already pushed exact matches at confidence=1.0, so further logic can go here if you
    //    want to prefer IPNI > Pterido, or filter duplicates, etc.

    return {
      original: author,
      issues,
      suggestions,
    };
  }

  /**
   * Splits a raw author string into individual “tokens.” For example:
   *   "L. ex Smith & Hook."  →  ["L.", "Smith", "Hook."]
   *   "F.J.Sm. & J.Hook"      →  ["F.J.Sm.", "J.Hook"]
   */
  private splitAuthors(input: string): string[] {
    return input
      .split(/(?:,\s*|;\s*|\s+ex\s+|\s+&\s+|\s+et\s+al\.?)/gi)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  }
}
