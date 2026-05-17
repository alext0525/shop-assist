import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const CATEGORY_CONTEXT = {
  keyboard: 'mechanical keyboards, membrane keyboards, wireless keyboards, gaming keyboards',
  backpack: 'backpacks for everyday carry, travel, hiking, school, laptop backpacks',
  gpu: 'graphics cards, GPUs for gaming, creative work, AI/ML, video editing',
  headphones: 'over-ear headphones, in-ear earbuds, wireless headsets, gaming headsets, noise-cancelling',
  monitor: 'gaming monitors, professional displays, ultrawide monitors, 4K displays, portable monitors',
  mouse: 'gaming mice, ergonomic mice, wireless mice, trackballs, productivity mice',
  laptop: 'gaming laptops, ultrabooks, business laptops, MacBooks, budget laptops',
  smartphone: 'Android phones, iPhones, budget smartphones, flagship phones, camera phones',
  'office-chair': 'ergonomic office chairs, gaming chairs, executive chairs, mesh chairs, lumbar support',
  smartwatch: 'smartwatches, fitness trackers, hybrid watches, Apple Watch, sports watches',
  'running-shoes': 'road running shoes, trail running shoes, everyday trainers, minimalist shoes, stability shoes',
};

const VAGUE_QUESTION_COUNT = 3;
const SPECIFIC_BATCH_SIZE = 4;
const SPECIFIC_MAX_QUESTIONS = 12;

export async function generateQuestions({ category, mode, previousQA = [], batchIndex = 0 }) {
  const categoryHint = CATEGORY_CONTEXT[category] || category;
  const isVague = mode === 'vague';

  const previousContext = previousQA.length
    ? `\n\nPrevious questions and answers:\n${previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}`
    : '';

  const prompt = isVague
    ? `You are a friendly shopping assistant helping someone find the perfect ${category}.
Context: ${categoryHint}

Ask exactly ${VAGUE_QUESTION_COUNT} broad, simple questions to understand their general needs.
These should be high-level preference questions (e.g. budget range, primary use, key priorities).
${previousContext}

Return ONLY a JSON array of question strings. No explanation. Example:
["What's your approximate budget?", "What will you mainly use it for?", "Any strong preferences on brand or style?"]`
    : `You are a friendly shopping assistant helping someone find the perfect ${category}.
Context: ${categoryHint}

This is batch ${batchIndex + 1}. Ask the next ${SPECIFIC_BATCH_SIZE} specific questions to deeply understand their exact needs.
Build on their previous answers to ask increasingly precise questions.
Cover technical specs, usage patterns, preferences, and constraints relevant to ${category}.
Do NOT repeat topics already covered.
${previousContext}

Return ONLY a JSON array of ${SPECIFIC_BATCH_SIZE} question strings. No explanation.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

export async function shouldContinueQuestions({ category, mode, previousQA, batchIndex }) {
  if (mode === 'vague') return false;
  if (previousQA.length >= SPECIFIC_MAX_QUESTIONS) return false;
  if (batchIndex === 0) return true;

  const previousContext = previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');

  const prompt = `You are a shopping assistant for ${category}.
So far you have asked ${previousQA.length} questions:
${previousContext}

Do you have enough information to make excellent, specific product recommendations?
Answer ONLY with "yes" or "no".`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].text.trim().toLowerCase().startsWith('no');
}

export async function generateSearchQueries({ category, mode, previousQA }) {
  const isVague = mode === 'vague';
  const context = previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');

  const prompt = `You are a shopping expert for ${category}.
Based on these user preferences:
${context}

Generate ${isVague ? 5 : 8} specific web search queries to find the best ${category} products that match their needs.
Make queries specific and targeted (include price ranges, specs, etc. when relevant).
Include queries like "best [category] [year] review" and "top [category] [specific feature]".

Return ONLY a JSON array of search query strings. No explanation.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

export async function rankAndFormatResults({ category, mode, previousQA, rawResults, images = [], feedback = null }) {
  const isVague = mode === 'vague';
  const targetCount = isVague ? 10 : 7;
  const context = previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const feedbackNote = feedback ? `\n\nUser refinement feedback: "${feedback}"\nPrioritise this feedback when ranking.` : '';

  const prompt = `You are a shopping expert for ${category}.

User preferences:
${context}${feedbackNote}

Raw search results:
${JSON.stringify(rawResults, null, 2)}

Available images (try to match to products by domain or content):
${images.slice(0, 20).join('\n')}

Select and rank the top ${targetCount} products that best match the user's needs.
For each product extract: name, price (if available), url, a 2-sentence reason why it matches their needs, 3-5 key specs, and try to find the best matching imageUrl from the available images list (match by domain name or product relevance — use null if none match well).

Return ONLY a JSON array:
[
  {
    "name": "Product Name",
    "price": "$X" or "~$X" or "Check price",
    "url": "https://...",
    "imageUrl": "https://... or null",
    "reason": "Why this matches their needs in 2 sentences.",
    "specs": ["Spec 1", "Spec 2", "Spec 3"],
    "score": 95
  }
]

Sort by score descending. No explanation outside the JSON.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

export async function refineWithFeedback({ category, originalQA, currentProducts, feedback }) {
  const context = originalQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const productsContext = currentProducts
    .map((p, i) => `${i + 1}. ${p.name} (${p.price || 'price unknown'})`)
    .join('\n');

  const prompt = `You are a friendly shopping assistant for ${category}.

Original user preferences:
${context}

Currently shown products:
${productsContext}

User feedback: "${feedback}"

Based on this feedback, do two things:
1. Write a warm 1-2 sentence acknowledgement of their feedback
2. Generate 5-7 new search queries that address their feedback while preserving their original needs

Return ONLY valid JSON (no markdown):
{
  "message": "Your acknowledgement here.",
  "queries": ["query 1", "query 2", "query 3", "query 4", "query 5"]
}`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
