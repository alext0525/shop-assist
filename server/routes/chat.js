import express from 'express';
import { generateQuestions, shouldContinueQuestions } from '../services/claude.js';

const router = express.Router();

router.post('/questions', async (req, res) => {
  try {
    const { category, mode, previousQA = [], batchIndex = 0 } = req.body;

    if (!category || !mode) {
      return res.status(400).json({ error: 'category and mode are required' });
    }

    const continueAsking = await shouldContinueQuestions({
      category,
      mode,
      previousQA,
      batchIndex,
    });

    if (!continueAsking && batchIndex > 0) {
      return res.json({ done: true, questions: [] });
    }

    const questions = await generateQuestions({ category, mode, previousQA, batchIndex });
    res.json({ done: false, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to generate questions' });
  }
});

export default router;
