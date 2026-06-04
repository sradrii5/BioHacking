/**
 * Service to interface with bioRxiv API.
 * documentation: https://api.biorxiv.org/
 */

export interface BioRxivStudy {
  doi: string;
  title: string;
  abstract: string;
  date: string;
  author: string;
  server: string;
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

function isBiohackingRelated(title: string, abstract: string = ''): boolean {
  const text = `${title} ${abstract}`.toLowerCase();
  
  const hasExclude = EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword));
  if (hasExclude) {
    console.log(`🚫 [bioRxiv] Filtering out irrelevant preprint: "${title}"`);
    return false;
  }

  const hasKeyword = BIOHACKING_KEYWORDS.some(keyword => text.includes(keyword));
  if (!hasKeyword) {
    console.log(`🚫 [bioRxiv] Filtering out non-biohacking preprint: "${title}"`);
  }
  return hasKeyword;
}

export class BioRxivService {
  private baseUrl = 'https://api.biorxiv.org/details';

  /**
   * Fetches recent pre-prints from bioRxiv or medRxiv and filters them for biohacking relevance.
   * @param count number of results
   * @param server 'biorxiv' or 'medrxiv'
   */
  async fetchRecent(count: number = 5, server: 'biorxiv' | 'medrxiv' = 'biorxiv'): Promise<BioRxivStudy[]> {
    // Dynamically calculate the last 14 days date interval for the bioRxiv details API
    const today = new Date().toISOString().split('T')[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // We request 100 items (the maximum per page) and then filter them for biohacking relevance
    const url = `${this.baseUrl}/${server}/${fourteenDaysAgo}/${today}/0`;
    
    try {
      console.log(`📡 [bioRxiv] Fetching latest preprints for interval: ${fourteenDaysAgo} to ${today} from ${server}...`);
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.collection || data.collection.length === 0) {
        console.log(`📭 [bioRxiv] No preprints found in interval.`);
        return [];
      }

      // Map raw data
      const mapped = data.collection.map((item: any) => ({
        doi: item.doi,
        title: item.title || '',
        abstract: item.abstract || '',
        date: item.date,
        author: item.authors,
        server: item.server
      }));

      // Filter in-memory for biohacking/longevity relevance
      const filtered = mapped.filter((study: any) => isBiohackingRelated(study.title, study.abstract));
      console.log(`📢 [bioRxiv] Found ${filtered.length} relevant biohacking preprints out of ${mapped.length} total from ${server}.`);

      return filtered.slice(0, count);
    } catch (error) {
      console.error('Error fetching from bioRxiv:', error);
      return [];
    }
  }
}
