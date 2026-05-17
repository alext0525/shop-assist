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
  speakers: 'Bluetooth speakers, bookshelf speakers, soundbars, portable speakers, party speakers',
  tablet: 'iPad, Android tablets, Windows tablets, drawing tablets, e-readers',
  tv: '4K TVs, OLED TVs, QLED TVs, smart TVs, gaming TVs, budget TVs',
  bike: 'road bikes, mountain bikes, e-bikes, commuter bikes, gravel bikes, hybrid bikes',
};

// Budget options per category (USD)
const BUDGET_OPTIONS = {
  keyboard:       ['Under $50', '$50–$100', '$100–$200', '$200+', 'E – Other, please specify'],
  backpack:       ['Under $40', '$40–$80', '$80–$150', '$150+', 'E – Other, please specify'],
  gpu:            ['Under $200', '$200–$400', '$400–$700', '$700–$1,000', 'E – Other, please specify'],
  headphones:     ['Under $50', '$50–$150', '$150–$350', '$350+', 'E – Other, please specify'],
  monitor:        ['Under $200', '$200–$400', '$400–$800', '$800+', 'E – Other, please specify'],
  mouse:          ['Under $30', '$30–$60', '$60–$120', '$120+', 'E – Other, please specify'],
  laptop:         ['Under $500', '$500–$900', '$900–$1,500', '$1,500+', 'E – Other, please specify'],
  smartphone:     ['Under $250', '$250–$500', '$500–$900', '$900+', 'E – Other, please specify'],
  'office-chair': ['Under $100', '$100–$250', '$250–$500', '$500+', 'E – Other, please specify'],
  smartwatch:     ['Under $100', '$100–$250', '$250–$500', '$500+', 'E – Other, please specify'],
  'running-shoes':['Under $60', '$60–$100', '$100–$160', '$160+', 'E – Other, please specify'],
  speakers:       ['Under $50', '$50–$150', '$150–$400', '$400+', 'E – Other, please specify'],
  tablet:         ['Under $200', '$200–$450', '$450–$800', '$800+', 'E – Other, please specify'],
  tv:             ['Under $400', '$400–$800', '$800–$1,500', '$1,500+', 'E – Other, please specify'],
  bike:           ['Under $400', '$400–$800', '$800–$2,000', '$2,000+', 'E – Other, please specify'],
};

const WEARABLE_CATEGORIES = new Set(['running-shoes', 'smartwatch']);
const SPECIFIC_BATCH_SIZE = 4;
const SPECIFIC_MAX_QUESTIONS = 12;

function budgetQuestion(category) {
  return {
    question: 'What is your budget?',
    options: BUDGET_OPTIONS[category] || ['Under $100', '$100–$300', '$300–$600', '$600+', 'E – Other, please specify'],
  };
}

const GENDER_QUESTION = {
  question: 'What is your gender? (helps tailor fit and style recommendations)',
  options: ['Male', 'Female', 'Non-binary / Either', 'E – Other, please specify'],
};

function extractBudget(previousQA) {
  const qa = previousQA.find(
    (qa) => qa.question.toLowerCase().includes('budget') || qa.question.toLowerCase().includes('price')
  );
  return qa ? qa.answer : null;
}

export async function generateQuestions({ category, mode, previousQA = [], batchIndex = 0 }) {
  const categoryHint = CATEGORY_CONTEXT[category] || category;
  const isVague = mode === 'vague';
  const isFirstBatch = batchIndex === 0;

  // Questions we must inject (only in first batch, if not already answered)
  const alreadyAnswered = previousQA.map((qa) => qa.question);
  const hasBudget = alreadyAnswered.some((q) => q.toLowerCase().includes('budget'));
  const hasGender = alreadyAnswered.some((q) => q.toLowerCase().includes('gender'));

  const previousContext = previousQA.length
    ? `\nPrevious Q&A:\n${previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}`
    : '';

  const targetCount = isVague ? 3 : SPECIFIC_BATCH_SIZE;
  // Reserve slots for injected questions
  const reservedSlots = isFirstBatch
    ? (hasBudget ? 0 : 1) + (WEARABLE_CATEGORIES.has(category) && !hasGender ? 1 : 0)
    : 0;
  const aiCount = Math.max(1, targetCount - reservedSlots);

  const prompt = `You are a friendly shopping assistant helping someone find the perfect ${category}.
Context: ${categoryHint}
${previousContext}

Generate exactly ${aiCount} questions to understand the user's needs for a ${category}.

RULES:
- Do NOT ask about budget or price (handled separately)
- Do NOT ask about gender (handled separately for wearable categories)
- For the FIRST batch, always ask about brand preference (with options)
- Use multiple-choice options (A–E, where E is always "E – Other, please specify") when options help narrow choices
- Use free-text (string) for open-ended questions needing specific details
- Build on previous answers — do not repeat topics

Return ONLY a valid JSON array. Each item is either:
- A plain string: "Your specific question here?"
- An object: {"question": "Your question?", "options": ["A option", "B option", "C option", "D option", "E – Other, please specify"]}

Example object:
{"question": "What will you primarily use it for?", "options": ["Gaming", "Work / Office", "Creative / Design", "General everyday use", "E – Other, please specify"]}`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  let aiQuestions = JSON.parse(jsonMatch ? jsonMatch[0] : text);

  // Inject required questions at the front of first batch
  if (isFirstBatch) {
    const injected = [];
    if (!hasBudget) injected.push(budgetQuestion(category));
    if (WEARABLE_CATEGORIES.has(category) && !hasGender) injected.push(GENDER_QUESTION);
    aiQuestions = [...injected, ...aiQuestions];
  }

  return aiQuestions.slice(0, targetCount);
}

export async function shouldContinueQuestions({ category, mode, previousQA, batchIndex }) {
  if (mode === 'vague') return false;
  if (previousQA.length >= SPECIFIC_MAX_QUESTIONS) return false;
  if (batchIndex === 0) return true;

  const previousContext = previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const prompt = `You are a shopping assistant for ${category}.
You have asked ${previousQA.length} questions so far:
${previousContext}

Do you have enough information (budget, use case, key preferences) to make great product recommendations?
Answer ONLY "yes" or "no".`;

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
  const budget = extractBudget(previousQA);
  const budgetNote = budget ? `User budget: ${budget}. Include price filters in queries.` : '';

  const prompt = `You are a shopping expert for ${category}.
User preferences:
${context}
${budgetNote}

Generate ${isVague ? 6 : 10} search queries to find matching products and reviews.
Include:
- Retailer queries: "best [specific type] site:amazon.com OR site:bestbuy.com" with price range if budget known
- Review/opinion queries: "[product] reddit review 2024 pros cons"
- If budget specified, include it in at least 2 queries (e.g. "best keyboard under $100")

Return ONLY a JSON array of strings.`;

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
  const budget = extractBudget(previousQA);
  const budgetNote = budget
    ? `STRICT BUDGET RULE: The user's budget is "${budget}". Only include products within or very close to this budget. Exclude anything clearly over budget.`
    : '';
  const feedbackNote = feedback ? `\nUser refinement feedback: "${feedback}" — prioritise this.` : '';

  const prompt = `You are a shopping expert for ${category}.

User preferences:
${context}
${budgetNote}${feedbackNote}

Raw search results (product pages + reviews):
${JSON.stringify(rawResults, null, 2)}

Available images (match to products by domain/name):
${images.slice(0, 20).join('\n')}

Select the top ${targetCount} products that best match the user's needs AND budget.
For each product:
- Prefer URLs from actual retailer pages (amazon.com, bestbuy.com, newegg.com, manufacturer sites)
- Extract real USD prices from content; use "Check price" only if truly not found
- Extract community sentiment from review content
- Try to match an imageUrl from the images list

Return ONLY valid JSON array (no markdown):
[
  {
    "name": "Full Product Name",
    "price": "$X",
    "url": "https://...",
    "imageUrl": "https://... or null",
    "reason": "2 sentences on why this matches this user's specific answers.",
    "pros": ["Community-praised aspect 1", "Praised aspect 2", "Praised aspect 3"],
    "cons": ["Common criticism 1", "Common criticism 2"],
    "communityNote": "1 sentence summarising overall community/reviewer sentiment.",
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
  const budget = extractBudget(originalQA);
  const productsContext = currentProducts.map((p, i) => `${i + 1}. ${p.name} (${p.price || 'unknown'})`).join('\n');

  const prompt = `You are a friendly shopping assistant for ${category}.
Original preferences:
${context}
${budget ? `Budget: ${budget} — maintain this constraint.` : ''}

Current products shown:
${productsContext}

User feedback: "${feedback}"

1. Write a warm 1–2 sentence acknowledgement
2. Generate 6–8 new search queries addressing their feedback while keeping original preferences and budget

Return ONLY valid JSON:
{
  "message": "...",
  "queries": ["query 1", "query 2", ...]
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
