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
    
    // Split the XML into individual article blocks
    const articleBlocks = xmlText.split(/<PubmedArticle>|<\/PubmedArticle>/i).filter(block => block.includes('<PMID'));
    const studies: PubMedStudy[] = [];
    
    articleBlocks.forEach(block => {
      const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/i);
      const titleMatch = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/i);
      const abstractMatch = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/i);
      
      // Date extraction
      const yearMatch = block.match(/<Year>(\d{4})<\/Year>/i);
      const monthMatch = block.match(/<Month>([\s\S]*?)<\/Month>/i);
      
      const pmid = pmidMatch ? pmidMatch[1] : '';
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
      const abstract = abstractMatch ? abstractMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
      
      // ONLY add if it has an actual abstract
      if (pmid && title && abstract && abstract.length > 10) {
        const cleanMonth = monthMatch ? monthMatch[1].padStart(2, '0') : '01';
        const cleanYear = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

        studies.push({
          pmid,
          title,
          abstract,
          pubDate: `${cleanYear}-${cleanMonth.match(/^\d+$/) ? cleanMonth : '01'}-01`,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        });
      }
    });

    console.log(`🔍 [PubMed] Found ${studies.length} valid studies with abstracts from ${pmids.length} requested.`);
    return studies;
  }
}
