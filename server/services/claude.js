import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const CATEGORY_CONTEXT = {
  keyboard:       'mechanical keyboards, membrane keyboards, wireless keyboards, gaming keyboards',
  backpack:       'backpacks for everyday carry, travel, hiking, school, laptop backpacks',
  gpu:            'graphics cards, GPUs for gaming, creative work, AI/ML, video editing',
  headphones:     'over-ear headphones, in-ear earbuds, wireless headsets, gaming headsets, noise-cancelling',
  monitor:        'gaming monitors, professional displays, ultrawide monitors, 4K displays, portable monitors',
  mouse:          'gaming mice, ergonomic mice, wireless mice, trackballs, productivity mice',
  laptop:         'gaming laptops, ultrabooks, business laptops, MacBooks, budget laptops',
  smartphone:     'Android phones, iPhones, budget smartphones, flagship phones, camera phones',
  'office-chair': 'ergonomic office chairs, gaming chairs, executive chairs, mesh chairs, lumbar support',
  smartwatch:     'smartwatches, fitness trackers, hybrid watches, Apple Watch, sports watches',
  'running-shoes':'road running shoes, trail running shoes, everyday trainers, minimalist shoes, stability shoes',
  speakers:       'Bluetooth speakers, bookshelf speakers, soundbars, portable speakers, party speakers',
  tablet:         'iPad, Android tablets, Windows tablets, drawing tablets, e-readers',
  tv:             '4K TVs, OLED TVs, QLED TVs, smart TVs, gaming TVs, budget TVs',
  bike:           'road bikes, mountain bikes, e-bikes, commuter bikes, gravel bikes, hybrid bikes',
};

// USD price range breakpoints per category
const BUDGET_RANGES = {
  keyboard:       [50, 100, 200],
  backpack:       [40, 80, 150],
  gpu:            [200, 400, 700, 1000],
  headphones:     [50, 150, 350],
  monitor:        [200, 400, 800],
  mouse:          [30, 60, 120],
  laptop:         [500, 900, 1500],
  smartphone:     [250, 500, 900],
  'office-chair': [100, 250, 500],
  smartwatch:     [100, 250, 500],
  'running-shoes':[60, 100, 160],
  speakers:       [50, 150, 400],
  tablet:         [200, 450, 800],
  tv:             [400, 800, 1500],
  bike:           [400, 800, 2000],
};

const WEARABLE_CATEGORIES = new Set(['running-shoes', 'smartwatch']);

function formatMoney(usd, rate, symbol) {
  const v = Math.round((usd * rate) / 5) * 5;
  return `${symbol}${v.toLocaleString()}`;
}

function getBudgetOptions(category, currencySymbol, currencyRate) {
  const points = BUDGET_RANGES[category] || [100, 300, 600];
  const opts = [];
  opts.push(`Under ${formatMoney(points[0], currencyRate, currencySymbol)}`);
  for (let i = 0; i < points.length - 1; i++) {
    opts.push(`${formatMoney(points[i], currencyRate, currencySymbol)}–${formatMoney(points[i + 1], currencyRate, currencySymbol)}`);
  }
  opts.push(`${formatMoney(points[points.length - 1], currencyRate, currencySymbol)}+`);
  opts.push('No preference');
  return opts;
}

function extractBudget(previousQA) {
  const qa = previousQA.find(qa =>
    qa.question.toLowerCase().includes('budget') || qa.question.toLowerCase().includes('price')
  );
  return qa ? qa.answer : null;
}

// --- SINGLE-QUESTION GENERATION ---

export async function generateNextQuestion({ category, mode, previousQA = [], currencyCode = 'USD', currencySymbol = '$', currencyRate = 1 }) {
  const isVague = mode === 'vague';
  const maxQ = isVague ? 3 : 12;
  const qNum = previousQA.length + 1;

  if (qNum > maxQ) return { done: true };

  // Q1 is always budget
  if (qNum === 1) {
    return {
      done: false,
      question: `What is your budget? (prices in ${currencyCode})`,
      options: getBudgetOptions(category, currencySymbol, currencyRate),
    };
  }

  // Q2 for wearables: gender
  const hasGender = previousQA.some(qa => qa.question.toLowerCase().includes('gender'));
  if (WEARABLE_CATEGORIES.has(category) && !hasGender && qNum === 2) {
    return {
      done: false,
      question: 'What is your gender? (helps tailor fit and style)',
      options: ['Male', 'Female', 'Non-binary / Either', 'No preference'],
    };
  }

  const categoryHint = CATEGORY_CONTEXT[category] || category;
  const context = previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const answeredTopics = previousQA.map(qa => qa.question).join(', ');

  const topicGuides = {
    laptop: `Possible topics (pick most relevant next one NOT yet covered): operating system, processor brand/tier, RAM amount (exact GB), screen size (exact inches), screen resolution & refresh rate, storage size & type (SSD/HDD), GPU requirement, battery life priority, weight/portability priority, build material/aesthetics, ports & connectivity, brand preference, display quality (colour accuracy vs brightness vs refresh rate). Deep Dive: ask exact numbers (e.g. "How much RAM?" not "RAM preferences?").`,
    gpu: `Possible topics: primary resolution target (1080p/1440p/4K), target frame rate, ray tracing importance, VRAM amount needed, power supply wattage, case size constraints, specific games/workloads, brand preference (Nvidia/AMD), new or used, dual-GPU slot size.`,
    headphones: `Possible topics: form factor (over-ear/on-ear/in-ear), open vs closed back, wired vs wireless, codec support (aptX/LDAC/AAC), noise cancellation requirement, microphone need, use environment (commute/studio/office/gym), driver type preference, impedance (for amplifier), brand preference.`,
    keyboard: `Possible topics: switch type (linear/tactile/clicky), wireless vs wired, form factor (full/TKL/65%/60%), RGB importance, hot-swap requirement, keycap material, actuation force preference, sound level (office/home), software ecosystem, build material (plastic/aluminium).`,
    monitor: `Possible topics: panel type (IPS/VA/OLED/TN), resolution (1080p/1440p/4K), refresh rate, response time, screen size, HDR requirement, G-Sync/FreeSync, colour accuracy (for creative work), curvature, aspect ratio (ultrawide?), connectivity (DisplayPort/HDMI/USB-C).`,
    smartphone: `Possible topics: operating system (Android/iOS), screen size, camera priority (main sensor/zoom/video), battery life, performance tier, 5G requirement, storage amount, brand preference, form factor (standard/plus/foldable), update longevity priority.`,
    bike: `Possible topics: riding terrain (road/trail/gravel/commute/mixed), frame material (aluminium/carbon/steel), groupset tier (Shimano tier), wheel size, electric assist (e-bike?), intended distance, rider height/frame size, gearing range, brakes (disc/rim), fender/rack compatibility.`,
    tv: `Possible topics: screen size (exact inches), panel technology (OLED/QLED/LED), primary use (movies/gaming/sports/mixed), refresh rate (60Hz/120Hz), HDR standard (Dolby Vision/HDR10+), smart TV OS, room lighting (bright/dark), viewing distance, wall mount or stand, HDMI 2.1 need.`,
    speakers: `Possible topics: use case (desktop/home theatre/portable/outdoor), powered vs passive, connectivity (Bluetooth/WiFi/wired), room size, stereo vs soundbar vs multi-room, bass priority, brand ecosystem (Sonos/Bose/etc.), voice assistant integration.`,
  };

  const topicGuide = topicGuides[category] || `Cover use case, key features, form factor, brand preference, and any technical specs relevant to ${category}.`;

  const modeNote = isVague
    ? `This is Quick Match — ask a BROAD lifestyle question. One preference at a time.`
    : `This is Deep Dive — ask a SPECIFIC TECHNICAL question about ONE exact spec. Use precise options (e.g. exact GB of RAM, exact screen size in inches). Do not bundle specs together.`;

  const prompt = `You are a shopping assistant. Generate the NEXT single question for buying a ${category}.

${modeNote}
This is question ${qNum} of ${maxQ}.

${topicGuide}

Previous Q&A so far:
${context || 'None yet.'}

Already covered topics: ${answeredTopics || 'None.'}

STRICT RULES:
1. Ask about EXACTLY ONE thing — never two specs in the same question
2. Do NOT repeat or rephrase any already-covered topic
3. Adapt to the user's answers — if they said "work laptop", only ask work-relevant follow-ups, NOT gaming questions
4. For Deep Dive: ask for exact values (16GB vs 32GB RAM, not "how much RAM do you need generally")
5. Always include "No preference" as the last option when using options

Return ONLY valid JSON:
{
  "question": "Single focused question?",
  "options": ["Option A", "Option B", "Option C", "No preference"]
}
OR for free-text:
{
  "question": "Open ended question?",
  "options": null
}`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

  // Ensure "No preference" is always present for option questions
  if (parsed.options && !parsed.options.some(o => o.toLowerCase().includes('preference'))) {
    parsed.options.push('No preference');
  }

  return { done: false, ...parsed };
}

// --- SEARCH QUERIES ---

export async function generateSearchQueries({ category, mode, previousQA, country, stores }) {
  const isVague = mode === 'vague';
  const context = previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const budget = extractBudget(previousQA);

  // Build region-specific retailer targets
  const regionRetailers = country && country !== 'United States'
    ? `Focus on retailers available in ${country}: ${stores || country}. Include queries like "buy [product] ${country}" and site-specific queries.`
    : `Focus on US retailers: amazon.com, bestbuy.com, newegg.com, bhphotovideo.com.`;

  const prompt = `You are a shopping expert for ${category}.
User needs:
${context}

Generate ${isVague ? 5 : 8} search queries. Mix:
1. Product discovery: "best [specific type] [year]" review/roundup queries
2. SHOPPING queries: "[exact product name] buy ${country || 'online'}" — these find actual purchase pages
3. Price queries: "[product] price ${country || ''} ${budget ? budget : ''}"

${regionRetailers}
${budget ? `Budget: ${budget} — include price constraint in at least 2 queries.` : ''}

Make queries specific based on the user's answers — not generic.
Return ONLY a JSON array of strings.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

// --- RANK AND FORMAT ---

export async function rankAndFormatResults({ category, mode, previousQA, rawResults, images = [], feedback = null, country, stores }) {
  const isVague = mode === 'vague';
  const targetCount = isVague ? 10 : 7;
  const context = previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const budget = extractBudget(previousQA);

  const budgetRule = budget && budget !== 'No preference'
    ? `STRICT BUDGET: "${budget}" — exclude products clearly over this budget.`
    : '';
  const regionRule = country && country !== 'United States'
    ? `REGION: User is in ${country}. Strongly prefer products from local retailers (${stores || country}). Exclude US-only deals.`
    : '';
  const feedbackNote = feedback ? `User feedback: "${feedback}" — prioritise this.` : '';

  const prompt = `You are a shopping expert for ${category}.

User answers:
${context}
${budgetRule}
${regionRule}
${feedbackNote}

Raw search results:
${JSON.stringify(rawResults, null, 2)}

Available images:
${images.slice(0, 20).join('\n')}

TASK: Return ${targetCount} product recommendations. Rules:
- GROUP variants of the same model (e.g. same laptop, different RAM/storage) into ONE entry with a "variants" array. Do not list the same model multiple times.
- For URL: prefer actual product listing pages from retailers (amazon, bestbuy, bol.com, coolblue, etc.). Avoid review sites as the main URL.
- For price: ONLY use a price explicitly stated in the search result snippets. Do not estimate. Use "Check price" if not found in results.
- For imageUrl: match from available images by domain/product name, or use null.
- Extract community sentiment from any review content in results.

Return ONLY valid JSON array:
[
  {
    "name": "Product Model Name (without config details)",
    "variants": [
      {"config": "16GB / 512GB SSD / RTX 4060", "price": "€999", "url": "https://bol.com/..."},
      {"config": "32GB / 1TB SSD / RTX 4070", "price": "€1299", "url": "https://bol.com/..."}
    ],
    "url": "https://best-purchase-link.com/product",
    "imageUrl": "https://... or null",
    "reason": "2 sentences explaining why this fits this user's specific answers.",
    "pros": ["Community-praised aspect 1", "Praised aspect 2", "Praised aspect 3"],
    "cons": ["Common criticism 1", "Common criticism 2"],
    "communityNote": "1 sentence on overall community/reviewer sentiment.",
    "specs": ["Key spec 1", "Key spec 2", "Key spec 3", "Key spec 4"],
    "score": 95
  }
]
Sort by score. No markdown, no explanation outside JSON.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

// --- MARKET SUMMARY ---

export async function generateMarketSummary({ category, previousQA, country }) {
  const context = previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
  const budget = extractBudget(previousQA);
  const regionNote = country ? `in ${country}` : '';

  const prompt = `You are a shopping expert. Write a brief 2-3 sentence market overview for someone buying a ${category} ${regionNote}.

Their profile:
${context}

Cover: what the current market looks like at ${budget || 'their budget'}, the best value options right now, and any key buying tips.
Be specific and helpful. Plain text only, no bullet points.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].text.trim();
}

// --- REFINE ---

export async function refineWithFeedback({ category, originalQA, currentProducts, feedback }) {
  const context = originalQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const budget = extractBudget(originalQA);
  const productsContext = currentProducts.map((p, i) => `${i + 1}. ${p.name}`).join('\n');

  const prompt = `Shopping assistant for ${category}.
Original preferences: ${context}
${budget && budget !== 'No preference' ? `Budget: ${budget} — keep this constraint.` : ''}
Current results: ${productsContext}
User feedback: "${feedback}"

1. Acknowledge feedback warmly in 1-2 sentences.
2. Generate 5-7 targeted search queries addressing the feedback.

Return ONLY valid JSON:
{"message": "...", "queries": ["q1", "q2", "q3", "q4", "q5"]}`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
