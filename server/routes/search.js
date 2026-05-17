import express from 'express';
import { generateSearchQueries, rankAndFormatResults, refineWithFeedback } from '../services/claude.js';
import { searchMultiple } from '../services/tavily.js';

const router = express.Router();

router.post('/products', async (req, res) => {
  try {
    const { category, mode, previousQA } = req.body;
    if (!category || !mode || !previousQA) {
      return res.status(400).json({ error: 'category, mode, and previousQA are required' });
    }

    const queries = await generateSearchQueries({ category, mode, previousQA });
    const { results: rawResults, images } = await searchMultiple(queries);

    if (rawResults.length === 0) {
      return res.status(404).json({ error: 'No products found. Try different preferences.' });
    }

    const ranked = await rankAndFormatResults({ category, mode, previousQA, rawResults, images });
    res.json({ products: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to search for products' });
  }
});

router.post('/refine', async (req, res) => {
  try {
    const { category, mode, originalQA, currentProducts, feedback } = req.body;
    if (!category || !feedback) {
      return res.status(400).json({ error: 'category and feedback are required' });
    }

    const { message, queries } = await refineWithFeedback({ category, originalQA, currentProducts, feedback });
    const { results: rawResults, images } = await searchMultiple(queries);

    if (rawResults.length === 0) {
      return res.json({ message, products: currentProducts });
    }

    const products = await rankAndFormatResults({
      category,
      mode,
      previousQA: originalQA,
      rawResults,
      images,
      feedback,
    });

    res.json({ message, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to refine results' });
  }
});

export default router;
