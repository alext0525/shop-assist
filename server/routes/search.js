import express from 'express';
import { generateSearchQueries, rankAndFormatResults, rankAndFormatResultsStreaming, generateMarketSummary, refineWithFeedback } from '../services/claude.js';
import { searchMultiple } from '../services/tavily.js';


const router = express.Router();

// Helper: write an SSE event
function sse(res, event, data) {
  if (!res.writableEnded) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

// Streaming endpoint — products arrive one by one
router.post('/products/stream', async (req, res) => {
  const { category, mode, previousQA, country, countryCode, stores } = req.body;

  if (!category || !mode || !previousQA) {
    return res.status(400).json({ error: 'category, mode, and previousQA are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep-alive ping every 20s so Railway/proxies don't drop the connection
  const keepAlive = setInterval(() => {
    if (!res.writableEnded) res.write(': ping\n\n');
  }, 20000);

  try {
    sse(res, 'status', { label: 'Searching the web…' });

    // Generate queries + market summary in parallel
    const [queries, marketSummary] = await Promise.all([
      generateSearchQueries({ category, mode, previousQA, country, stores }),
      generateMarketSummary({ category, previousQA, country }),
    ]);

    sse(res, 'summary', { marketSummary });
    sse(res, 'status', { label: 'Reading product pages…' });

    const { results: rawResults, images } = await searchMultiple(queries);

    if (rawResults.length === 0) {
      sse(res, 'error', { message: 'No products found. Try different preferences.' });
      return;
    }

    sse(res, 'status', { label: 'Ranking results for you…' });

    await rankAndFormatResultsStreaming({
      category, mode, previousQA, rawResults, images, country, stores,
      onProduct: (product) => sse(res, 'product', product),
    });

    sse(res, 'done', {});
  } catch (err) {
    console.error('[stream error]', err);
    sse(res, 'error', { message: err.message || 'Search failed' });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
});

// Streaming refine — AI message arrives first, then products trickle in
router.post('/refine/stream', async (req, res) => {
  const { category, mode, originalQA, currentProducts, feedback, country, stores } = req.body;
  if (!category || !feedback) {
    return res.status(400).json({ error: 'category and feedback are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const keepAlive = setInterval(() => {
    if (!res.writableEnded) res.write(': ping\n\n');
  }, 20000);

  try {
    sse(res, 'status', { label: 'Thinking about your feedback…' });

    const { message, queries } = await refineWithFeedback({ category, originalQA, currentProducts, feedback });
    sse(res, 'message', { message });
    sse(res, 'status', { label: 'Searching for better matches…' });

    const { results: rawResults, images } = await searchMultiple(queries);

    if (rawResults.length === 0) {
      sse(res, 'done', { noResults: true });
      return;
    }

    sse(res, 'status', { label: 'Ranking results for you…' });

    await rankAndFormatResultsStreaming({
      category, mode, previousQA: originalQA, rawResults, images, feedback, country, stores,
      onProduct: (product) => sse(res, 'product', product),
    });

    sse(res, 'done', {});
  } catch (err) {
    console.error('[refine/stream error]', err);
    sse(res, 'error', { message: err.message || 'Refinement failed' });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
});

// Non-streaming fallback (used by refine)
router.post('/products', async (req, res) => {
  try {
    const { category, mode, previousQA, country, countryCode, stores } = req.body;
    if (!category || !mode || !previousQA) {
      return res.status(400).json({ error: 'category, mode, and previousQA are required' });
    }
    const [queries, marketSummary] = await Promise.all([
      generateSearchQueries({ category, mode, previousQA, country, stores }),
      generateMarketSummary({ category, previousQA, country }),
    ]);
    const { results: rawResults, images } = await searchMultiple(queries);
    if (rawResults.length === 0) return res.status(404).json({ error: 'No products found.' });
    const products = await rankAndFormatResults({ category, mode, previousQA, rawResults, images, country, stores });
    res.json({ products, marketSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to search for products' });
  }
});

router.post('/refine', async (req, res) => {
  try {
    const { category, mode, originalQA, currentProducts, feedback, country, stores } = req.body;
    if (!category || !feedback) return res.status(400).json({ error: 'category and feedback are required' });
    const { message, queries } = await refineWithFeedback({ category, originalQA, currentProducts, feedback });
    const { results: rawResults, images } = await searchMultiple(queries);
    if (rawResults.length === 0) return res.json({ message, products: currentProducts });
    const products = await rankAndFormatResults({ category, mode, previousQA: originalQA, rawResults, images, feedback, country, stores });
    res.json({ message, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to refine results' });
  }
});

export default router;
