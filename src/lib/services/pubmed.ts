/**
 * Service to interface with PubMed API (E-utilities).
 * documentation: https://www.ncbi.nlm.nih.gov/books/NBK25500/
 */

export interface PubMedStudy {
  pmid: string;
  title: string;
  abstract: string;
  pubDate: string;
  url: string;
  // Enriched fields for high-quality AI content generation
  authors: string[];          // e.g. ["Smith J", "Garcia R"]
  firstAuthorLastName: string; // e.g. "Smith"
  institution: string;        // Primary affiliation of first author
  journal: string;            // Journal name
  doi: string;                // DOI if available
  sampleSizeHint: string;     // Raw text hint extracted for sample size (n=X, X participants, etc.)
}

/** Strips XML/HTML tags from a raw XML text node. */
function stripTags(raw: string): string {
  return raw.replace(/<[^>]*>?/gm, '').trim();
}

export class PubMedService {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  /**
   * Searches for recent studies based on a query.
   */
  async searchStudies(query: string, maxResults: number = 5): Promise<string[]> {
    const url = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}&sort=pub+date`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.esearchresult.idlist || [];
  }

  /**
   * Fetches full enriched details for a list of PMIDs.
   * Extracts authors, institution, journal, DOI, and sample size hints
   * alongside title, abstract and date.
   */
  async fetchStudyDetails(pmids: string[]): Promise<PubMedStudy[]> {
    if (pmids.length === 0) return [];
    
    const url = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
    const response = await fetch(url);
    const xmlText = await response.text();
    
    const articleBlocks = xmlText
      .split(/<PubmedArticle>|<\/PubmedArticle>/i)
      .filter(block => block.includes('<PMID'));
    
    const studies: PubMedStudy[] = [];
    
    articleBlocks.forEach(block => {
      const pmidMatch    = block.match(/<PMID[^>]*>(\d+)<\/PMID>/i);
      const titleMatch   = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/i);
      const abstractMatch = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/i);
      const yearMatch    = block.match(/<Year>(\d{4})<\/Year>/i);
      const monthMatch   = block.match(/<Month>([\s\S]*?)<\/Month>/i);

      const pmid     = pmidMatch    ? pmidMatch[1]               : '';
      const title    = titleMatch   ? stripTags(titleMatch[1])   : '';
      const abstract = abstractMatch ? stripTags(abstractMatch[1]) : '';

      if (!pmid || !title || !abstract || abstract.length < 10) return;

      // ── Authors ──────────────────────────────────────────────────────────
      const authorMatches = [...block.matchAll(/<Author[^>]*>([\s\S]*?)<\/Author>/gi)];
      const authors = authorMatches.map(m => {
        const lastName  = m[1].match(/<LastName>([\s\S]*?)<\/LastName>/i);
        const initials  = m[1].match(/<Initials>([\s\S]*?)<\/Initials>/i);
        const collective = m[1].match(/<CollectiveName>([\s\S]*?)<\/CollectiveName>/i);
        if (collective) return stripTags(collective[1]);
        const ln = lastName ? stripTags(lastName[1]) : '';
        const in_ = initials ? stripTags(initials[1]) : '';
        return `${ln} ${in_}`.trim();
      }).filter(Boolean);

      const firstAuthorLastName = (() => {
        const first = authorMatches[0];
        if (!first) return '';
        const ln = first[1].match(/<LastName>([\s\S]*?)<\/LastName>/i);
        return ln ? stripTags(ln[1]) : '';
      })();

      // ── Institution (first affiliation found) ────────────────────────────
      const affMatch = block.match(/<Affiliation>([\s\S]*?)<\/Affiliation>/i);
      // Trim to first sentence / comma segment to keep it concise
      const rawAff   = affMatch ? stripTags(affMatch[1]) : '';
      const institution = rawAff.split(/[,;]/)[0].trim();

      // ── Journal ───────────────────────────────────────────────────────────
      const journalMatch = block.match(/<Title>([\s\S]*?)<\/Title>/i);
      const journal = journalMatch ? stripTags(journalMatch[1]) : '';

      // ── DOI ───────────────────────────────────────────────────────────────
      const doiMatch = block.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/i);
      const doi = doiMatch ? stripTags(doiMatch[1]) : '';

      // ── Sample size hint (look for n=X or "X participants / subjects") ───
      const sampleMatch = abstract.match(
        /\b(?:n\s*=\s*\d[\d,]*|\d[\d,]*\s*(?:participants?|subjects?|patients?|volunteers?|individuals?))\b/i
      );
      const sampleSizeHint = sampleMatch ? sampleMatch[0] : '';

      // ── Date ──────────────────────────────────────────────────────────────
      const cleanMonth = monthMatch ? monthMatch[1].padStart(2, '0') : '01';
      const cleanYear  = yearMatch  ? yearMatch[1] : new Date().getFullYear().toString();

      studies.push({
        pmid,
        title,
        abstract,
        pubDate: `${cleanYear}-${cleanMonth.match(/^\d+$/) ? cleanMonth : '01'}-01`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        authors,
        firstAuthorLastName,
        institution,
        journal,
        doi,
        sampleSizeHint,
      });
    });

    console.log(`🔍 [PubMed] Found ${studies.length} enriched studies from ${pmids.length} requested.`);
    return studies;
  }
}
