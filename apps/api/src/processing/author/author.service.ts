import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IpniAuthor } from '@taxon-cleaner/api-database';
import {
  AuthorResult,
  AuthorIssue,
  AuthorSuggestion,
} from '../../shared/types';

interface ParsedAuthor {
  original: string;
  surname: string;
  forename: string | null;
  particles: string[];
  isPrimary: boolean;
}

interface Candidate {
  standardForm: string;
  source: string;
}

interface AuthorGroup {
  content: string;
  isInBrackets: boolean;
}

@Injectable()
export class AuthorService {
  private readonly PARTICLES = new Set([
    'de',
    'van',
    'von',
    'di',
    'da',
    'le',
    'la',
    'al',
    'el',
    'bin',
    'ibn',
    'st',
    'saint',
    'af',
    'zu',
    'av',
    'della',
    'vander',
    'van der',
    'van den',
    'de la',
    'des',
    "d'",
  ]);

  private readonly NOMENCLATURAL_NOTATIONS = new Set([
    'comb',
    'comb.',
    'ined',
    'ined.',
    'nom',
    'nom.',
    'nud',
    'nud.',
    'illeg',
    'illeg.',
    'superfl',
    'superfl.',
    'non',
    'sensu',
    'auct',
    'auct.',
    'f',
    'f.',
  ]);

  private readonly AUTHOR_SEPARATORS = /\s+ex\s+|&|,|\s+/i;
  private readonly CLEAR_SEPARATORS = /\s+ex\s+|&|,/i;

  // Cache to store original author -> corrected author mappings
  private cache: Map<string, string> = new Map();

  constructor(
    @Inject('IpniAuthorRepository')
    private readonly ipniRepo: Repository<IpniAuthor>
  ) {}

  setCache(cache: Map<string, string>): void {
    this.cache = cache;
  }

  /** Replace `fil.`→`f.` and collapse `. f.`→`.f.` */
  private normalizeFiliusNotation(name: string): string {
    let n = name;
    n = n.replace(/\bfil\./g, 'f.');
    n = n.replace(/\.\s+(f\.|fil\.)/g, '.$1');
    return n;
  }

  /** Fix encoding glitches (double or single‐encoded accents) */
  private fixEncodingIssues(input: string): string {
    return (
      input
        // double-encoded first
        .replace(/ÃƒÂ©/g, 'é')
        .replace(/ÃƒÂ¨/g, 'è')
        .replace(/ÃƒÂª/g, 'ê')
        .replace(/ÃƒÂ´/g, 'ô')
        .replace(/ÃƒÂ§/g, 'ç')
        .replace(/ÃƒÂ¡/g, 'á')
        .replace(/ÃƒÂ /g, 'à')
        .replace(/ÃƒÂ±/g, 'ñ')
        .replace(/ÃƒÂ¶/g, 'ö')
        .replace(/ÃƒÂ¼/g, 'ü')
        // single-encoded next
        .replace(/Ã©/g, 'é')
        .replace(/Ã¨/g, 'è')
        .replace(/Ãª/g, 'ê')
        .replace(/Ã´/g, 'ô')
        .replace(/Ã§/g, 'ç')
        .replace(/Ã¡/g, 'á')
        .replace(/Ã /g, 'à')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã¶/g, 'ö')
        .replace(/Ã¼/g, 'ü')
        .replace(/Ã¦/g, 'æ')
        .replace(/Å/g, 'œ')
        .replace(/â€™/g, "'")
        .replace(/â€"/g, '—')
        .replace(/â€"/g, '–')
    );
  }

  /**
   * Main entry: split into bracket/groups, then process each group.
   * FIXED: Now properly handles multiple authors and preserves full strings
   */
  async normalizeAll(raw: string): Promise<AuthorResult[]> {
    if (!raw?.trim()) return [];

    try {
      const originalRaw = raw.trim();

      // STEP 1: Check cache FIRST - if we have a cached correction, use it immediately
      if (this.cache.has(originalRaw)) {
        const cachedCorrection = this.cache.get(originalRaw)!;
        console.log(`🎯 CACHE HIT: "${originalRaw}" -> "${cachedCorrection}"`);

        return [
          {
            original: originalRaw,
            cleaned: cachedCorrection,
            issues: [
              {
                type: 'info',
                message: `Auto-corrected from cache: "${cachedCorrection}"`,
                details: 'Applied cached correction',
              },
            ],
            suggestions: [],
          },
        ];
      }

      // STEP 2: If not in cache, proceed with normal processing
      // 1) fix & normalize Unicode + filius on the *whole* string
      const fullCleaned = this.normalizeFiliusNotation(
        this.fixEncodingIssues(originalRaw).normalize('NFC').trim()
      );

      // 2) PRESERVE nomenclatural notations - extract them but keep them
      const { main: cleanMain, trailing: nomenclaturalPart } =
        this.stripTrailingNotation(fullCleaned);

      if (
        !cleanMain ||
        this.isPureNomenclaturalNotation(cleanMain) ||
        this.isYear(cleanMain)
      ) {
        return []; // nothing to do
      }

      // 3) Process the main part for corrections
      const correctedMain = await this.processMainAuthorString(cleanMain);

      // 4) Reconstruct the full string with nomenclatural parts
      const finalCorrected = nomenclaturalPart
        ? `${correctedMain} ${nomenclaturalPart}`
        : correctedMain;

      // 5) Cache the result if it was corrected
      if (correctedMain !== cleanMain) {
        console.log(
          `🔧 AUTO-CORRECTED: "${originalRaw}" -> "${finalCorrected}"`
        );
        this.cache.set(originalRaw, finalCorrected);

        return [
          {
            original: originalRaw,
            cleaned: finalCorrected,
            issues: [
              {
                type: 'info',
                message: `Auto-corrected from "${originalRaw}" to "${finalCorrected}"`,
                details: 'Auto-correction applied',
              },
            ],
            suggestions: [],
          },
        ];
      }

      // 6) No correction needed, but still validate
      const groups = this.extractAuthorGroups(cleanMain);
      const results = await Promise.all(
        groups.map((g) =>
          this.processAuthorGroup(g, originalRaw, finalCorrected)
        )
      );

      return results.flat();
    } catch (err) {
      return [
        {
          original: raw,
          cleaned: raw,
          issues: [
            {
              type: 'error',
              message: err instanceof Error ? err.message : 'Unknown',
            },
          ],
          suggestions: [],
        },
      ];
    }
  }

  /**
   * NEW METHOD: Process the main author string and apply corrections to all parts
   */
  private async processMainAuthorString(mainString: string): Promise<string> {
    // Extract all author groups (bracketed and non-bracketed)
    const groups = this.extractAuthorGroups(mainString);
    let wasAnyCorrected = false;

    const processedGroups = await Promise.all(
      groups.map(async (group) => {
        const correctedContent = await this.correctGroupContent(group.content);
        if (correctedContent !== group.content) {
          wasAnyCorrected = true;
        }

        return {
          ...group,
          content: correctedContent,
        };
      })
    );

    // Reconstruct the string
    let result = '';
    for (const group of processedGroups) {
      if (group.isInBrackets) {
        result += `(${group.content})`;
      } else {
        if (result && !result.endsWith(' ') && !group.content.startsWith(' ')) {
          result += ' ';
        }
        result += group.content;
      }
    }

    return result.trim();
  }

  /**
   * NEW METHOD: Correct content within a single group (handles multiple authors)
   */
  private async correctGroupContent(content: string): Promise<string> {
    if (!content?.trim()) return content;

    // Split on clear separators but preserve the separators
    const parts = content.split(/(\s+ex\s+|&|,)/i);
    const correctedParts = await Promise.all(
      parts.map(async (part, index) => {
        // If this is a separator (odd indices), return as-is
        if (index % 2 === 1) return part;

        // Otherwise, try to correct this author part
        const trimmedPart = part.trim();
        if (!trimmedPart || this.isYear(trimmedPart)) return part;

        return (await this.correctSingleAuthor(trimmedPart)) || part;
      })
    );

    return correctedParts.join('');
  }

  /**
   * NEW METHOD: Apply Level 2 correction to a single author token
   */
  private async correctSingleAuthor(
    authorToken: string
  ): Promise<string | null> {
    // Try Level 1 first
    const level1 = await this.checkLevel1(authorToken);
    if (level1.isValid) {
      return null; // No correction needed
    }

    // Try Level 2 correction (remove spaces)
    if (authorToken.includes(' ')) {
      const spacesRemoved = authorToken.replace(/\s+/g, '');
      const level2Check = await this.ipniRepo
        .createQueryBuilder('a')
        .where('a.standard_form = :form', { form: spacesRemoved })
        .getCount();

      if (level2Check > 0) {
        console.log(`✅ LEVEL 2 MATCH: "${authorToken}" -> "${spacesRemoved}"`);
        return spacesRemoved;
      }
    }

    return null; // No correction possible
  }

  /**
   * UPDATED: Strip off any trailing nomenclatural tokens but preserve them
   */
  private stripTrailingNotation(input: string) {
    const parts = input.split(/\s+/);
    let idx = parts.length;

    // Find where nomenclatural notation starts
    while (
      idx > 0 &&
      this.NOMENCLATURAL_NOTATIONS.has(
        parts[idx - 1].toLowerCase().replace(/\.+$/, '')
      )
    ) {
      idx--;
    }

    return {
      main: parts.slice(0, idx).join(' ').trim(),
      trailing: idx < parts.length ? parts.slice(idx).join(' ') : null,
    };
  }

  private isPureNomenclaturalNotation(s: string): boolean {
    const toks = s
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/\.+$/, ''));
    return (
      toks.length > 0 && toks.every((t) => this.NOMENCLATURAL_NOTATIONS.has(t))
    );
  }

  private isYear(tok: string): boolean {
    return /^\d{4}$/.test(tok.trim());
  }

  /** Pull out parenthetical vs non‐parenthetical chunks */
  private extractAuthorGroups(input: string): AuthorGroup[] {
    const groups: AuthorGroup[] = [];
    let buf = '',
      depth = 0;
    for (const c of input) {
      if (c === '(') {
        if (depth === 0 && buf.trim()) {
          groups.push({ content: buf.trim(), isInBrackets: false });
          buf = '';
        }
        depth++;
      } else if (c === ')') {
        depth--;
        if (depth === 0 && buf.trim()) {
          groups.push({ content: buf.trim(), isInBrackets: true });
          buf = '';
        }
      } else {
        buf += c;
      }
    }
    if (buf.trim()) groups.push({ content: buf.trim(), isInBrackets: false });
    return groups;
  }

  /**
   * Handle one group: split on clear separators (ex/&/,) or treat as single,
   * then delegate to per‐token 3-level checks
   */
  private async processAuthorGroup(
    group: AuthorGroup,
    originalRaw: string,
    fullCleanedMain: string
  ): Promise<AuthorResult[]> {
    const txt = group.content.trim();
    if (!txt) return [];

    // split on "ex", "&", "," if present
    const parts = this.CLEAR_SEPARATORS.test(txt)
      ? txt
          .split(this.CLEAR_SEPARATORS)
          .map((p) => p.trim())
          .filter((p) => p && !this.isYear(p))
      : [txt];

    // run each through the individual pipeline
    const results = await Promise.all(
      parts.map((p) => this.processIndividual(p, originalRaw, fullCleanedMain))
    );

    return results.flat();
  }

  /** The 3‐level IPNI check on a single author token */
  private async processIndividual(
    token: string,
    originalRaw: string,
    fullCleanedMain: string
  ): Promise<AuthorResult[]> {
    // LEVEL 1
    const l1 = await this.checkLevel1(token);
    if (l1.isValid) {
      return [
        {
          original: originalRaw,
          cleaned: fullCleanedMain, // Use the cleaned version
          issues: [],
          suggestions: [],
        },
      ];
    }

    // LEVEL 2 - This is where the magic happens for auto-correction
    const l2 = await this.checkLevel2(token, originalRaw);
    if (l2.isValid && l2.correctedForm) {
      console.log(
        `🔧 LEVEL 2 CORRECTION: "${originalRaw}" -> "${l2.correctedForm}"`
      );

      // Cache the correction for future use
      this.cache.set(originalRaw, l2.correctedForm);

      return [
        {
          original: originalRaw,
          cleaned: l2.correctedForm, // Return the corrected form
          issues: [
            {
              type: 'info',
              message: `Auto-corrected to "${l2.correctedForm}" (spaces removed)`,
              details: 'Level 2 auto-correction applied',
            },
          ],
          suggestions: [],
        },
      ];
    }

    // LEVEL 3
    const l3 = await this.checkLevel3(token);
    // if non‐clear (single) but every part valid → OK
    if (l3.every((r) => r.isValid)) {
      return [
        {
          original: originalRaw,
          cleaned: fullCleanedMain,
          issues: [],
          suggestions: [],
        },
      ];
    }

    // otherwise collect errors + suggestions
    const out: AuthorResult[] = [];
    for (const r of l3) {
      if (!r.isValid) {
        const sug = await this.generateSuggestions(r.authorName);
        out.push({
          original: originalRaw,
          cleaned: fullCleanedMain,
          issues: r.issues,
          suggestions: sug,
        });
      }
    }
    return out;
  }

  /** LEVEL 1: exact‐match against IPNI.standard_form */
  private async checkLevel1(
    content: string
  ): Promise<{ isValid: boolean; issues: AuthorIssue[] }> {
    const cnt = await this.ipniRepo
      .createQueryBuilder('a')
      .where('a.standard_form=:f', { f: content })
      .getCount();
    return cnt > 0
      ? { isValid: true, issues: [] }
      : {
          isValid: false,
          issues: [
            {
              type: 'error',
              message: `No IPNI standard form matches found for "${content}"`,
              details: 'Level 1 exact failed',
            },
          ],
        };
  }

  /**
   * LEVEL 2: remove all spaces and retry exact
   * CRITICAL: Now returns the corrected form for auto-correction
   */
  private async checkLevel2(
    content: string,
    originalRaw: string
  ): Promise<{
    isValid: boolean;
    issues: AuthorIssue[];
    correctedForm?: string;
  }> {
    if (!content.includes(' ')) return { isValid: false, issues: [] };

    const spacesRemovedForm = content.replace(/\s+/g, '');
    const cnt = await this.ipniRepo
      .createQueryBuilder('a')
      .where('a.standard_form=:f', { f: spacesRemovedForm })
      .getCount();

    if (cnt > 0) {
      console.log(`✅ LEVEL 2 MATCH: "${content}" -> "${spacesRemovedForm}"`);

      return {
        isValid: true,
        issues: [],
        correctedForm: spacesRemovedForm, // Return the corrected form
      };
    }

    return {
      isValid: false,
      issues: [
        {
          type: 'error',
          message: `No IPNI standard form matches for combined "${spacesRemovedForm}"`,
          details: 'Level 2 failed',
        },
      ],
    };
  }

  /** LEVEL 3: split on ANY whitespace/ex/&/, and check each chunk */
  private async checkLevel3(
    content: string
  ): Promise<
    Array<{ authorName: string; isValid: boolean; issues: AuthorIssue[] }>
  > {
    const parts = content
      .split(this.AUTHOR_SEPARATORS)
      .map((p) => p.trim())
      .filter((p) => p && !this.isYear(p));
    const out = [];
    for (const p of parts) {
      const name = p.replace(/^[^\w\s.'-]+|[^\w\s.'-]+$/g, '').trim();
      if (!name) continue;
      const cnt = await this.ipniRepo
        .createQueryBuilder('a')
        .where('a.standard_form=:f', { f: name })
        .getCount();
      if (cnt > 0) {
        out.push({ authorName: name, isValid: true, issues: [] });
      } else {
        out.push({
          authorName: name,
          isValid: false,
          issues: [
            {
              type: 'error',
              message: `No IPNI standard form matches found for "${name}"`,
              details: 'Level 3 failed',
            },
          ],
        });
      }
    }
    return out;
  }

  /** Suggest near-matches via your existing parse→candidates→levenshtein flow */
  private async generateSuggestions(
    authorName: string
  ): Promise<AuthorSuggestion[]> {
    try {
      const parsed = this.parseAuthorName(authorName);
      const cands = this.generateCandidates(parsed);
      const recs = await this.findSimilarRecords(cands);
      return this.createSuggestions(recs, cands);
    } catch {
      return [];
    }
  }

  /**
   * Parse author name into components
   */
  private parseAuthorName(authorName: string): ParsedAuthor {
    let content = authorName.trim();

    // Handle filius notation: strip trailing "f." or ".f." etc.
    const filiusMatch = content.match(/(.*?)[,\s]*\.?f(?:\.|ilius)?\s*$/i);
    if (filiusMatch) {
      content = filiusMatch[1].trim();
    }

    // Split into parts
    const parts = content.split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) {
      return {
        original: authorName,
        surname: '',
        forename: null,
        particles: [],
        isPrimary: false,
      };
    }

    // Extract particles
    const particles: string[] = [];
    const coreParts = [...parts];

    while (coreParts.length > 1) {
      // Check for two-word particles
      if (coreParts.length > 1) {
        const twoWord = `${coreParts[0].toLowerCase()} ${coreParts[1].toLowerCase()}`;
        if (this.PARTICLES.has(twoWord)) {
          particles.push(coreParts.shift()! + ' ' + coreParts.shift()!);
          continue;
        }
      }

      // Check for single-word particles
      const oneWord = coreParts[0].toLowerCase();
      if (this.PARTICLES.has(oneWord)) {
        coreParts.shift();
        particles.push(oneWord);
        continue;
      }

      break;
    }

    // Last part is surname, rest are forenames
    const surname = coreParts.pop() || '';
    const forename = coreParts.length > 0 ? coreParts.join(' ') : null;

    return {
      original: authorName,
      surname,
      forename,
      particles,
      isPrimary: false,
    };
  }

  /**
   * Generate candidate variations for similarity matching
   */
  private generateCandidates(parsed: ParsedAuthor): Candidate[] {
    const candidates: Candidate[] = [];
    const { forename, surname, particles } = parsed;

    if (!surname) return candidates;

    const formsSet = new Set<string>();

    const addForm = (form: string, source: string) => {
      form = form.trim();
      if (!form || formsSet.has(form)) return;

      candidates.push({ standardForm: form, source });
      formsSet.add(form);

      // Add version with dot if not present
      if (!form.endsWith('.')) {
        const withDot = form + '.';
        if (!formsSet.has(withDot)) {
          candidates.push({
            standardForm: withDot,
            source: source + '_with_dot',
          });
          formsSet.add(withDot);
        }
      }
    };

    // Basic surname
    addForm(surname, 'exact_surname');

    // With particles
    if (particles.length > 0) {
      const fullSurname = [...particles, surname].join(' ');
      addForm(fullSurname, 'full_surname_with_particles');
    }

    // With forename variations
    if (forename) {
      const forenameWords = forename.split(/\s+/).filter((p) => p.length > 0);

      // First initial + surname
      const firstInitial = forenameWords[0].charAt(0).toUpperCase() + '.';
      addForm(`${firstInitial}${surname}`, 'initial_surname');
      addForm(`${firstInitial} ${surname}`, 'initial_spaced_surname');

      // All initials + surname
      if (forenameWords.length > 1) {
        const allInitials = forenameWords
          .map((w) => w.charAt(0).toUpperCase() + '.')
          .join('');
        addForm(`${allInitials}${surname}`, 'multi_initial_surname');
        addForm(`${allInitials} ${surname}`, 'multi_initial_spaced_surname');

        const spacedInitials = forenameWords
          .map((w) => w.charAt(0).toUpperCase() + '.')
          .join(' ');
        addForm(`${spacedInitials} ${surname}`, 'spaced_initials_surname');
      }

      // Full forename + surname
      addForm(`${forename} ${surname}`, 'full_forename_surname');

      // Individual forename parts as potential surnames
      for (const part of forenameWords) {
        addForm(part, 'forename_part_as_surname');
      }
    }

    // Truncated surname for long names
    if (surname.length > 8) {
      const truncated = surname.substring(0, 8) + '.';
      addForm(truncated, 'truncated_surname');
    }

    // First component of hyphenated surnames
    const firstComponent = surname.split(/[-\s]/)[0];
    if (
      firstComponent &&
      firstComponent !== surname &&
      firstComponent.length > 1
    ) {
      addForm(firstComponent, 'first_surname_component');
    }

    return candidates.slice(0, 15); // Limit candidates
  }

  /**
   * Find similar records in database
   */
  private async findSimilarRecords(
    candidates: Candidate[]
  ): Promise<Array<{ id: number; standard_form: string }>> {
    if (candidates.length === 0) return [];

    const forms = candidates.map((c) => c.standardForm);
    const collected = new Map<string, { id: number; standard_form: string }>();

    // Prefix matching
    await this.runSimilarityQuery(forms, false, collected);

    // Contains matching
    await this.runSimilarityQuery(forms, true, collected);

    return Array.from(collected.values()).slice(0, 50);
  }

  /**
   * Run similarity query (prefix or contains)
   */
  private async runSimilarityQuery(
    forms: string[],
    useContains: boolean,
    collected: Map<string, { id: number; standard_form: string }>
  ): Promise<void> {
    let qb = this.ipniRepo
      .createQueryBuilder('author')
      .select(['author.id AS id', 'author.standardForm AS standard_form']);

    forms.forEach((form, idx) => {
      const pattern = useContains ? `%${form}%` : `${form}%`;
      const paramName = `${useContains ? 'cpattern' : 'pattern'}${idx}`;
      const clause = `BINARY author.standardForm LIKE :${paramName}`;
      const params = { [paramName]: pattern };

      qb = idx === 0 ? qb.where(clause, params) : qb.orWhere(clause, params);
    });

    const rawResults = await qb.limit(50).getRawMany();

    rawResults.forEach((r) => {
      const standardForm = r.standard_form as string;
      const key = standardForm.toLowerCase();

      if (!collected.has(key)) {
        const idVal = typeof r.id === 'number' ? r.id : parseInt(r.id, 10);
        collected.set(key, { id: idVal, standard_form: standardForm });
      }
    });
  }

  /**
   * Create suggestions from similar records
   */
  private createSuggestions(
    records: Array<{ id: number; standard_form: string }>,
    candidates: Candidate[]
  ): AuthorSuggestion[] {
    const suggestions: AuthorSuggestion[] = [];
    const seen = new Set<string>();

    for (const record of records) {
      const standardForm = record.standard_form;
      if (!standardForm || seen.has(standardForm)) continue;
      seen.add(standardForm);

      // Find best matching candidate
      let bestMatch: Candidate | null = null;
      let minDistance = Infinity;

      for (const candidate of candidates) {
        const distance = this.levenshteinDistance(
          candidate.standardForm,
          standardForm
        );
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = candidate;
        }
      }

      // Calculate confidence
      const maxLength = Math.max(
        standardForm.length,
        bestMatch?.standardForm.length || 0
      );
      const confidence = maxLength > 0 ? 1 - minDistance / maxLength : 0;

      // Only include high-confidence suggestions
      if (confidence > 0.4) {
        suggestions.push({
          type: 'author',
          confidence: Math.round(confidence * 100) / 100,
          correctedAuthor: standardForm,
          source: 'ipni',
          metadata: {
            ipniId: record.id,
            source: bestMatch?.source || 'unknown',
            distance: minDistance,
          },
        });
      }
    }

    // Sort by confidence and limit to top 10
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0)
    );

    // Initialize first row and column
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }
}
