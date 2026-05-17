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
  speakers: 'Bluetooth speakers, bookshelf speakers, soundbars, portable speakers, party speakers, home audio',
  tablet: 'iPad, Android tablets, Windows tablets, drawing tablets, e-readers',
  tv: '4K TVs, OLED TVs, QLED TVs, smart TVs, gaming TVs, budget TVs, large screen TVs',
  bike: 'road bikes, mountain bikes, e-bikes, commuter bikes, gravel bikes, hybrid bikes',
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

Generate ${isVague ? 6 : 10} search queries to find the best ${category} products and reviews.
Mix two types:
1. Product-finding queries: "best [specific type] [year] site:amazon.com OR site:bestbuy.com OR site:newegg.com"
2. Review/opinion queries: "best [specific type] reddit review pros cons 2024" or "[product type] worth buying community opinion"

Return ONLY a JSON array of search query strings. No explanation.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
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
  const feedbackNote = feedback ? `\n\nUser refinement feedback: "${feedback}"\nPrioritise this when ranking.` : '';

  const prompt = `You are a shopping expert for ${category}.

User preferences:
${context}${feedbackNote}

Raw search results (includes product pages AND review/community discussions):
${JSON.stringify(rawResults, null, 2)}

Available images (match to products by URL domain or product name):
${images.slice(0, 20).join('\n')}

Task: Select the top ${targetCount} distinct products. For each product:
- Prefer URLs from actual retailer/product pages (amazon.com, bestbuy.com, newegg.com, bhphotovideo.com, manufacturer sites) over review aggregators
- Extract real prices where visible in the content; use "Check price" if not found
- Extract community sentiment from review content in the results (reddit posts, review articles)
- Match an imageUrl from the available images list using domain similarity

Return ONLY a valid JSON array, no markdown:
[
  {
    "name": "Full Product Name",
    "price": "$X" or "~$X" or "Check price",
    "url": "https://retailer-or-product-page.com/...",
    "imageUrl": "https://... or null",
    "reason": "2 sentences on why this matches the user's specific needs.",
    "pros": ["Praised aspect 1", "Praised aspect 2", "Praised aspect 3"],
    "cons": ["Common criticism 1", "Common criticism 2"],
    "communityNote": "1 sentence summarising overall community/reviewer opinion.",
    "specs": ["Spec 1", "Spec 2", "Spec 3", "Spec 4"],
    "score": 95
  }
]

Sort by score descending.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
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
2. Generate 6-8 new search queries that address their feedback while preserving their original needs.
   Mix product-finding queries and review/opinion queries.

Return ONLY valid JSON (no markdown):
{
  "message": "Your acknowledgement here.",
  "queries": ["query 1", "query 2", "query 3", "query 4", "query 5", "query 6"]
}`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
