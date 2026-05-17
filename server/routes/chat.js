import express from 'express';
import { generateNextQuestion } from '../services/claude.js';

const router = express.Router();

router.post('/next-question', async (req, res) => {
  try {
    const { category, mode, previousQA = [], currencyCode, currencySymbol, currencyRate } = req.body;
    if (!category || !mode) return res.status(400).json({ error: 'category and mode are required' });

    const result = await generateNextQuestion({
      category, mode, previousQA,
      currencyCode: currencyCode || 'USD',
      currencySymbol: currencySymbol || '$',
      currencyRate: currencyRate || 1,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to generate question' });
  }
});

export default router;
