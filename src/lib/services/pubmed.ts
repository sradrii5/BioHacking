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
   * Fetches details (abstract, title, date) for a list of PMIDs.
   */
  async fetchStudyDetails(pmids: string[]): Promise<PubMedStudy[]> {
    if (pmids.length === 0) return [];
    
    const url = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
    const response = await fetch(url);
    const xmlText = await response.text();
    
    // Simple XML parsing logic (in a real app, use a proper parser like fast-xml-parser)
    // For this prototype, we use regex to extract content to avoid adding too many dependencies
    const studies: PubMedStudy[] = [];
    
    pmids.forEach(pmid => {
      // Very basic regex extraction for the prototype
      const titleMatch = xmlText.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/i);
      const abstractMatch = xmlText.match(/<AbstractText>([\s\S]*?)<\/AbstractText>/i);
      const yearMatch = xmlText.match(/<Year>(\d{4})<\/Year>/i);
      const monthMatch = xmlText.match(/<Month>([\s\S]*?)<\/Month>/i);
      
      const cleanMonth = monthMatch ? monthMatch[1].padStart(2, '0') : '01';
      const cleanYear = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

      studies.push({
        pmid,
        title: titleMatch ? titleMatch[1].replace(/<[^>]*>?/gm, '') : 'No Title',
        abstract: abstractMatch ? abstractMatch[1].replace(/<[^>]*>?/gm, '') : 'No Abstract',
        pubDate: `${cleanYear}-${cleanMonth.match(/^\d+$/) ? cleanMonth : '01'}-01`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      });
    });

    return studies;
  }
}
