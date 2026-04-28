import { PubMedService } from '../src/lib/services/pubmed';

async function test() {
  const pubmed = new PubMedService();
  console.log('Searching...');
  const ids = await pubmed.searchStudies('longevity', 2);
  console.log('IDs found:', ids);
  
  if (ids.length > 0) {
    console.log('Fetching details...');
    const details = await pubmed.fetchStudyDetails(ids);
    console.log('Details:', JSON.stringify(details, null, 2));
  }
}

test();
