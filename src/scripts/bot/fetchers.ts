import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
});

export interface RawArticle {
  title: string;
  link: string;
  contentSnippet?: string;
  pubDate?: string;
  source: 'PubMed' | 'ScienceDaily' | 'News';
}

/**
 * Fetches latest longevity articles from ScienceDaily RSS
 */
export async function fetchScienceDaily(): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL('https://www.sciencedaily.com/rss/health_medicine/longevity.xml');
    return feed.items.slice(0, 5).map(item => ({
      title: item.title || '',
      link: item.link || '',
      contentSnippet: item.contentSnippet,
      pubDate: item.pubDate,
      source: 'ScienceDaily'
    }));
  } catch (error) {
    console.error('Error fetching ScienceDaily:', error);
    return [];
  }
}

/**
 * Fetches latest longevity studies from PubMed using their API
 */
export async function fetchPubMed(): Promise<RawArticle[]> {
  try {
    const query = 'longevity[Title/Abstract] AND (hacker OR protocol OR supplement)';
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5&sort=pub_date`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    const ids = data.esearchresult.idlist || [];

    if (ids.length === 0) return [];

    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    return ids.map((id: string) => {
      const item = detailsData.result[id];
      return {
        title: item.title || '',
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        pubDate: item.pubdate,
        source: 'PubMed' as const
      };
    });
  } catch (error) {
    console.error('Error fetching PubMed:', error);
    return [];
  }
}
