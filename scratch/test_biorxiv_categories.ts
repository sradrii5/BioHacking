async function test() {
  console.log('Fetching bioRxiv details with date range...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://api.biorxiv.org/details/biorxiv/${sevenDaysAgo}/${today}/0`;
    console.log('URL:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Received data, collection length:', data.collection?.length);
    if (data.collection) {
      data.collection.slice(0, 15).forEach((item: any, i: number) => {
        console.log(`[${i}] Title: ${item.title}`);
        console.log(`    Category: ${item.category}`);
      });
    } else {
      console.log('No collection found in response', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
