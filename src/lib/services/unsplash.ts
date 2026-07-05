/**
 * Unsplash service for fetching cover images for articles.
 * Uses the free Unsplash API (no auth required for demo access).
 * For production, use UNSPLASH_ACCESS_KEY for higher rate limits.
 */

export interface UnsplashImage {
  url: string;          // Regular size (1080px wide) — ideal for article covers
  thumbnail: string;    // Small size (400px) — for article card thumbnails
  alt: string;          // Alt text from Unsplash description
  credit: string;       // Photographer name for attribution (required by Unsplash ToS)
  creditUrl: string;    // Link to photographer profile
}

// Curated topic → Unsplash collection IDs for high-quality science imagery
// These produce much better results than generic keyword searches
const TOPIC_COLLECTIONS: Record<string, string> = {
  default: '317099',      // Nature & Science
  brain: '1167977',       // Neuroscience / Brain
  longevity: '4333098',   // Health & Wellness
  fitness: '3330448',     // Sports & Fitness
  nutrition: '3330452',   // Food & Nutrition
  sleep: '1163825',       // Relax / Sleep
  dna: '317099',          // Science / DNA
  microbiome: '3330452',  // Biology
};

// Keyword → search terms mapping to avoid generic or misleading results
const KEYWORD_TO_QUERY: Record<string, string> = {
  'nmn': 'longevity biology science',
  'nad+': 'molecular biology research',
  'nad': 'molecular biology research',
  'resveratrol': 'red wine grapes science',
  'rapamycin': 'laboratory research biology',
  'metformin': 'laboratory science medicine',
  'fisetin': 'strawberry fruit science',
  'quercetin': 'plant biology science',
  'ashwagandha': 'plant herb medicine',
  'spermidine': 'wheat grain biology',
  'mtor': 'cellular biology science',
  'ampk': 'cellular biology science',
  'telomere': 'dna cell science',
  'autophagy': 'cellular biology science',
  'mitochondria': 'cellular energy biology',
  'alzheimer': 'brain neuroscience science',
  'dementia': 'brain neuroscience science',
  'cancer': 'medical research science',
  'parkinson': 'neuroscience brain science',
  'vo2': 'athlete running performance',
  'sleep': 'sleeping rest night',
  'fasting': 'water glass minimalist health',
  'sauna': 'sauna steam wellness spa',
  'cold plunge': 'cold water ice plunge',
  'exercise': 'workout fitness running',
  'gut': 'healthy food nutrition meal',
  'microbiome': 'healthy food gut nutrition',
};

/**
 * Derives a search query from article keywords and title.
 */
function buildSearchQuery(keywords: string[], title: string): string {
  // Check if any keyword has a curated mapping
  for (const kw of keywords) {
    const lower = kw.toLowerCase();
    if (KEYWORD_TO_QUERY[lower]) {
      return KEYWORD_TO_QUERY[lower];
    }
  }

  // Extract meaningful words from title (skip stopwords)
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'en', 'de', 'del', 'que', 'se',
    'new', 'study', 'shows', 'reveals', 'suggests', 'found', 'may', 'could', 'can',
    'nuevo', 'estudio', 'muestra', 'revela', 'sugiere', 'puede', 'podría']);

  const titleWords = title.toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 3);

  if (titleWords.length > 0) {
    return `${titleWords.join(' ')} science health`;
  }

  return 'science biology health research';
}

/**
 * Fetches a relevant cover image from Unsplash for an article.
 * Falls back gracefully if the API is unavailable.
 */
export async function fetchUnsplashImage(
  keywords: string[],
  title: string
): Promise<UnsplashImage | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('⚠️ [Unsplash] UNSPLASH_ACCESS_KEY not set. Skipping image fetch.');
    return null;
  }

  const query = buildSearchQuery(keywords, title);
  const orientation = 'landscape';
  const perPage = 10;

  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', orientation);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('content_filter', 'high'); // Safe content only

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      next: { revalidate: 86400 }, // Cache for 24h
    });

    if (!response.ok) {
      console.warn(`⚠️ [Unsplash] API responded with ${response.status} for query: "${query}"`);
      return null;
    }

    const data = await response.json();
    const results = data.results ?? [];

    if (results.length === 0) {
      // Fallback: search for generic science/health image
      return fetchFallbackImage(accessKey);
    }

    // Pick a random result from the top 5 to avoid repetition
    const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];

    return {
      url: pick.urls.regular,       // ~1080px wide
      thumbnail: pick.urls.small,   // ~400px wide
      alt: pick.alt_description || pick.description || `${query} image`,
      credit: pick.user.name,
      creditUrl: `${pick.user.links.html}?utm_source=biohackerage&utm_medium=referral`,
    };
  } catch (error: any) {
    console.error('[Unsplash] Fetch error:', error.message);
    return null;
  }
}

async function fetchFallbackImage(accessKey: string): Promise<UnsplashImage | null> {
  try {
    const response = await fetch(
      'https://api.unsplash.com/search/photos?query=science+laboratory+biology&orientation=landscape&per_page=10',
      {
        headers: { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const results = data.results ?? [];
    if (results.length === 0) return null;
    const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];
    return {
      url: pick.urls.regular,
      thumbnail: pick.urls.small,
      alt: 'Science research laboratory',
      credit: pick.user.name,
      creditUrl: `${pick.user.links.html}?utm_source=biohackerage&utm_medium=referral`,
    };
  } catch {
    return null;
  }
}
