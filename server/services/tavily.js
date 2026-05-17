const TAVILY_API_URL = 'https://api.tavily.com/search';

export async function searchProducts(query) {
  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 5,
      include_images: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.statusText}`);
  }

  const data = await response.json();
  const images = (data.images || []).map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
  return { results: data.results || [], images };
}

export async function searchMultiple(queries) {
  const settled = await Promise.allSettled(queries.map(searchProducts));
  const allResults = [];
  const allImages = [];
  const seen = new Set();

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      for (const item of result.value.results) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          allResults.push(item);
        }
      }
      allImages.push(...result.value.images);
    }
  }

  return { results: allResults, images: [...new Set(allImages)].slice(0, 30) };
}
