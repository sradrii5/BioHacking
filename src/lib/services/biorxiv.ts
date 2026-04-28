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

export class BioRxivService {
  private baseUrl = 'https://api.biorxiv.org/details';

  /**
   * Fetches recent pre-prints from bioRxiv or medRxiv.
   * @param count number of results
   * @param server 'biorxiv' or 'medrxiv'
   */
  async fetchRecent(count: number = 5, server: 'biorxiv' | 'medrxiv' = 'biorxiv'): Promise<BioRxivStudy[]> {
    // BioRxiv API works by intervals. We'll fetch the last 30 items and filter.
    const url = `${this.baseUrl}/${server}/0/30`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.collection || data.collection.length === 0) return [];

      // Map and slice to requested count
      return data.collection.slice(0, count).map((item: any) => ({
        doi: item.doi,
        title: item.title,
        abstract: item.abstract,
        date: item.date,
        author: item.authors,
        server: item.server
      }));
    } catch (error) {
      console.error('Error fetching from bioRxiv:', error);
      return [];
    }
  }
}
