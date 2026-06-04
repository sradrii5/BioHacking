import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

export interface RawArticle {
  title: string;
  link: string;
  contentSnippet?: string;
  pubDate?: string;
  source: 'PubMed' | 'ScienceDaily' | 'News';
}

const BIOHACKING_KEYWORDS = [
  'longevity', 'aging', 'ageing', 'anti-aging', 'anti-ageing', 'lifespan', 'healthspan',
  'cognitive', 'nootropic', 'brain', 'memory', 'neuroprotection', 'neurodegenerative',
  'autophagy', 'fasting', 'mitochondria', 'mitochondrial', 'microbiome', 'gut health',
  'peptide', 'sleep quality', 'circadian', 'melatonin', 'hormesis', 'cold plunge', 'sauna',
  'heat shock', 'cold shock', 'sirtuin', 'ampk', 'mtor', 'rapamycin', 'metformin',
  'senolytic', 'senescent', 'supplement', 'resveratrol', 'nad+', 'nmn', 'nicotinamide',
  'quercetin', 'fisetin', 'curcumin', 'ashwagandha', 'bacopa', 'lion\'s mane', 'exercise',
  'muscle mass', 'hypertrophy', 'vo2 max', 'cardiovascular health', 'metabolic health',
  'epigenetic', 'telomere', 'stem cell', 'cellular reprogramming', 'biohack', 'performance'
];

const EXCLUDE_KEYWORDS = [
  'pregnancy', 'pregnant', 'preeclampsia', 'pre-eclampsia', 'fetal', 'fetus',
  'buffalo', 'buffaloes', 'cow', 'cows', 'sheep', 'goat', 'goat\'s', 'pig', 'pigs', 'veterinary',
  'pediatric', 'infant', 'childhood', 'maternal', 'embryo transfer', 'obstetric',
  'plant biology', 'crop', 'agriculture', 'forest', 'spruce', 'beetle', 'bark'
];

export function isBiohackingRelated(title: string, content: string = ''): boolean {
  const text = `${title} ${content}`.toLowerCase();
  
  const hasExclude = EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword));
  if (hasExclude) {
    console.log(`🚫 Filtering out irrelevant study: "${title}"`);
    return false;
  }

  const hasKeyword = BIOHACKING_KEYWORDS.some(keyword => text.includes(keyword));
  if (!hasKeyword) {
    console.log(`🚫 Filtering out non-biohacking study: "${title}"`);
  }
  return hasKeyword;
}

/**
 * Fetches latest longevity articles from ScienceDaily RSS and others
 */
export async function fetchScienceDaily(): Promise<RawArticle[]> {
  const feeds = [
    'https://www.sciencedaily.com/rss/top/health.xml',
    'https://www.news-medical.net/tag/feed/Longevity.aspx',
    'https://www.medicalnewstoday.com/rss/health-news',
    'https://scitechdaily.com/category/health/feed/',
    'https://www.eurekalert.org/rss/medicine_and_health.xml'
  ];

  let allArticles: RawArticle[] = [];

  for (const url of feeds) {
    try {
      console.log(`📡 Trying RSS feed: ${url}`);
      const feed = await parser.parseURL(url);
      if (feed.items.length > 0) {
        const mapped = feed.items.map(item => ({
          title: item.title || '',
          link: item.link || '',
          contentSnippet: item.contentSnippet,
          pubDate: item.pubDate,
          source: 'News' as const
        }));
        allArticles = [...allArticles, ...mapped];
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch RSS from ${url}:`, (error as any).message);
    }
  }

  // Filter for biohacking/longevity relevance
  const filteredArticles = allArticles.filter(art => isBiohackingRelated(art.title, art.contentSnippet || ''));
  console.log(`📢 RSS Ingestion: Found ${filteredArticles.length} biohacking articles out of ${allArticles.length} total.`);

  // Return a random selection of the filtered ones
  return filteredArticles.sort(() => Math.random() - 0.5).slice(0, 10);
}

/**
 * Fetches latest longevity studies from PubMed using their API
 */
export async function fetchPubMed(): Promise<RawArticle[]> {
  try {
    const query = '(longevity[Title/Abstract] OR "aging"[Title/Abstract] OR "anti-aging"[Title/Abstract] OR "mitochondria"[Title/Abstract] OR "autophagy"[Title/Abstract] OR "cognitive enhancement"[Title/Abstract] OR "nootropic"[Title/Abstract] OR "healthspan"[Title/Abstract]) AND ("protocol"[Title/Abstract] OR "supplement"[Title/Abstract] OR "intervention"[Title/Abstract] OR "diet"[Title/Abstract] OR "exercise"[Title/Abstract])';
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=20&sort=pub_date`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    const ids = data.esearchresult.idlist || [];

    if (ids.length === 0) return [];

    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const mapped = ids.map((id: string) => {
      const item = detailsData.result[id];
      return {
        title: item?.title || '',
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        pubDate: item?.pubdate,
        source: 'PubMed' as const
      };
    }).filter((art: any) => art.title);

    // Double check with keyword filters to be absolutely safe
    const filtered = mapped.filter((art: any) => isBiohackingRelated(art.title));
    console.log(`📢 PubMed Ingestion: Found ${filtered.length} relevant biohacking studies out of ${mapped.length} fetched.`);

    return filtered.slice(0, 5);
  } catch (error) {
    console.error('Error fetching PubMed:', error);
    return [];
  }
}
