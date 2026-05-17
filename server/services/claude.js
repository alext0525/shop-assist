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
  bike:               'road bikes, mountain bikes, e-bikes, commuter bikes, gravel bikes, hybrid bikes',
  'jewelry-rings':    'engagement rings, wedding bands, fashion rings, signet rings, eternity rings, fine jewelry',
  'jewelry-necklace': 'necklaces, chains, pendants, chokers, fine jewelry necklaces, gold and silver necklaces',
  'jewelry-earrings': 'earrings, studs, hoops, drop earrings, dangle earrings, fine jewelry earrings',
  'jewelry-bracelet': 'bracelets, bangles, cuffs, tennis bracelets, charm bracelets, fine jewelry bracelets',
  'jewelry-watch':    'luxury watches, fashion watches, dress watches, Swiss watches, automatic watches, fine timepieces',
  'jewelry-brooch':   'brooches, pins, decorative pins, vintage brooches, fashion brooches',
  'jewelry-anklet':   'anklets, ankle bracelets, gold anklets, silver anklets, beach jewelry',
  tripod:             'camera tripods, travel tripods, gorillapods, video tripods, monopods, fluid head tripods',
  'camera-flash': 'camera flashes, speedlites, TTL flashes, studio strobes, off-camera flash, ring lights',
  'camera-storage': 'SD cards, SDXC, CFexpress cards, XQD cards, camera memory cards for photo and video',
  'field-monitor': 'on-camera field monitors, director monitors, HDMI monitors for cameras, video assist monitors',
  microphone:     'shotgun microphones, lavalier mics, USB microphones, podcast mics, on-camera mics, wireless mic systems',
  'camera-filter': 'ND filters, circular polarising filters, UV filters, graduated ND, variable ND, lens filter kits',
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
  bike:               [400, 800, 2000],
  'jewelry-rings':    [200, 500, 1500, 5000],
  'jewelry-necklace': [100, 300, 1000, 3000],
  'jewelry-earrings': [50, 200, 800, 2500],
  'jewelry-bracelet': [100, 300, 1000, 3000],
  'jewelry-watch':    [300, 1000, 5000, 15000],
  'jewelry-brooch':   [30, 100, 400],
  'jewelry-anklet':   [30, 100, 400],
  tripod:             [50, 150, 400],
  'camera-flash':     [100, 300, 700],
  'camera-storage':   [20, 60, 150],
  'field-monitor':    [150, 400, 800],
  microphone:         [50, 150, 400],
  'camera-filter':    [30, 80, 200],
};

const WEARABLE_CATEGORIES = new Set(['running-shoes', 'smartwatch']);

// Categories where we ask type BEFORE budget (subtype dramatically shifts price)
const TYPE_BEFORE_BUDGET = new Set(['bike']);

// Per-subtype budget breakpoints (USD) for type-aware categories
const BIKE_TYPE_BUDGETS = {
  'road':             [800, 1500, 3000, 6000],
  'triathlon':        [1500, 3500, 7000, 12000],
  'mountain':         [600, 1200, 2500, 5000],
  'gravel':           [800, 1500, 3000, 5500],
  'city':             [300, 600, 1200, 2500],
  'hybrid':           [300, 600, 1200, 2500],
  'e-bike':           [1000, 2000, 4000, 8000],
  'bmx':              [200, 500, 1000, 2500],
};

const BIKE_TYPE_QUESTION = {
  question: 'What type of bike are you looking for?',
  options: ['Road bike', 'Triathlon / TT bike', 'Mountain bike (MTB)', 'Gravel bike', 'City / Hybrid bike', 'E-bike', 'No preference'],
};

function bikeTypeFromAnswer(answer) {
  if (!answer) return null;
  const a = answer.toLowerCase();
  if (a.includes('triathlon') || a.includes('tt')) return 'triathlon';
  if (a.includes('road')) return 'road';
  if (a.includes('mountain') || a.includes('mtb')) return 'mountain';
  if (a.includes('gravel')) return 'gravel';
  if (a.includes('city') || a.includes('hybrid')) return 'city';
  if (a.includes('e-bike') || a.includes('electric')) return 'e-bike';
  if (a.includes('bmx')) return 'bmx';
  return null;
}

function formatMoney(usd, rate, symbol) {
  const v = Math.round((usd * rate) / 5) * 5;
  return `${symbol}${v.toLocaleString()}`;
}

function getBudgetOptions(category, currencySymbol, currencyRate, bikeType = null) {
  let points;
  if (category === 'bike' && bikeType && BIKE_TYPE_BUDGETS[bikeType]) {
    points = BIKE_TYPE_BUDGETS[bikeType];
  } else {
    points = BUDGET_RANGES[category] || [100, 300, 600];
  }
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

  const hasBudget = previousQA.some(qa => qa.question.toLowerCase().includes('budget'));
  const hasType = TYPE_BEFORE_BUDGET.has(category)
    ? previousQA.some(qa => qa.question.toLowerCase().includes('type of bike'))
    : true;

  // For type-before-budget categories: Q1 = type
  if (TYPE_BEFORE_BUDGET.has(category) && !hasType) {
    if (category === 'bike') return { done: false, ...BIKE_TYPE_QUESTION };
  }

  // Budget question — after type for bike, first for everything else
  if (!hasBudget) {
    let bikeType = null;
    if (category === 'bike') {
      const typeQA = previousQA.find(qa => qa.question.toLowerCase().includes('type of bike'));
      bikeType = bikeTypeFromAnswer(typeQA?.answer);
    }
    return {
      done: false,
      question: `What is your budget? (prices in ${currencyCode})`,
      options: getBudgetOptions(category, currencySymbol, currencyRate, bikeType),
    };
  }

  // Q2 for wearables: gender
  const hasGender = previousQA.some(qa => qa.question.toLowerCase().includes('gender'));
  if (WEARABLE_CATEGORIES.has(category) && !hasGender) {
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
    laptop: `Topics (pick most relevant NOT yet covered): brand preference (Apple/Lenovo ThinkPad/ASUS/Dell/HP/MSI/Razer — ask with options), operating system (Windows/macOS/Linux), processor brand (Intel Core Ultra/AMD Ryzen), RAM amount (exact GB), screen size (exact inches), screen resolution & refresh rate, storage capacity & type, GPU tier (integrated/discrete — RTX/RX series), battery priority, weight class, build material, ports, display quality. NOTE: brand matters — ASUS ROG vs TUF vs Zenbook are very different.`,
    gpu: `Topics (pick most relevant NOT yet covered): GPU chip maker (Nvidia RTX / AMD Radeon RX / Intel Arc — ask first if not answered), AIB partner brand (ASUS ROG Strix/TUF / MSI Gaming X/Suprim / Gigabyte Gaming OC/AORUS / Zotac AMP / Sapphire Pulse/Nitro for AMD — ask with these exact options), primary resolution (1080p/1440p/4K), target frame rate, ray tracing importance, VRAM amount needed, power supply wattage, case clearance (length/thickness), specific games or workloads, cooler preference (2-fan/3-fan/blower).`,
    headphones: `Topics (pick most relevant NOT yet covered): brand preference (Sony WH/WF / Bose QC/Ultra / Sennheiser Momentum / Apple AirPods / Beyerdynamic DT / Audio-Technica ATH — offer as options), form factor (over-ear/on-ear/in-ear), open vs closed back, wired vs wireless, noise cancellation, microphone need, codec support (aptX/LDAC/AAC), use environment (commute/office/studio/gym/gaming), impedance (for amp matching), driver type. NOTE: Sony vs Bose vs Beyerdynamic have very different sound signatures — brand matters.`,
    keyboard: `Topics (pick most relevant NOT yet covered): brand preference (Keychron / Razer / Corsair / Logitech / Ducky / Leopold / SteelSeries / NuPhy / HHKB — offer as options), switch type (linear/tactile/clicky with specific switches e.g. Cherry MX/Gateron/Kailh), wireless vs wired, form factor (full/TKL/75%/65%/60%), hot-swap socket, keycap material (PBT/ABS), RGB, sound dampening, software/macro support.`,
    mouse: `Topics (pick most relevant NOT yet covered): brand preference (Logitech G / Razer / SteelSeries / Zowie / Pulsar / Glorious / Endgame Gear / Asus ROG — offer as options), wired vs wireless, grip style (palm/claw/fingertip), size (small/medium/large), sensor preference (optical), DPI range, weight (lightweight <70g / mid 70-90g / heavier), side buttons count, shape (symmetrical/ergonomic).`,
    monitor: `Topics (pick most relevant NOT yet covered): brand preference (LG UltraGear / Samsung Odyssey / ASUS ROG/TUF / Dell / BenQ / Gigabyte / AOC — offer as options), panel type (IPS/VA/OLED/QD-OLED), resolution (1080p/1440p/4K/ultrawide), refresh rate (60/144/165/240Hz), screen size, response time (GtG ms), HDR standard, G-Sync/FreeSync, colour accuracy (sRGB/DCI-P3 coverage), curvature, aspect ratio, connectivity. NOTE: LG OLED vs Samsung Odyssey Neo have very different picture profiles.`,
    smartphone: `Topics (pick most relevant NOT yet covered): brand preference (Apple iPhone / Samsung Galaxy / Google Pixel / OnePlus / Xiaomi / Sony Xperia / Nothing — offer as options), operating system (iOS/Android), screen size, camera priority (photography/video/zoom), battery capacity, performance tier (flagship/mid-range), storage, 5G, update support longevity, form factor (standard/plus/compact/foldable). NOTE: iPhone vs Pixel vs Samsung have distinct ecosystems — ask brand early.`,
    bike: `Topics: frame material (aluminium / carbon fibre / steel/chromoly), groupset brand (Shimano 105/Ultegra/Di2 / SRAM Rival/Force/Red / Campagnolo), groupset tier, wheel size, brakes (mechanical disc/hydraulic disc/rim), geometry (race/endurance/aero for road/TT), frame brand preference (Trek / Specialized / Giant / Canyon / Bianchi / Cervélo / Look / Pinarello), saddle/fit priority, rim depth, tyre clearance.`,
    tv: `Topics (pick most relevant NOT yet covered): brand preference (LG OLED / Samsung Neo QLED / Sony Bravia / Philips OLED / Hisense — offer as options), screen size (exact inches), panel technology (OLED/QLED/LED), primary use (movies/gaming/sports), refresh rate (60/120Hz), HDR standard (Dolby Vision/HDR10+), smart TV OS (webOS/Tizen/Google TV), room lighting, viewing distance, HDMI 2.1 ports. NOTE: LG OLED vs Samsung Neo QLED have very different picture science.`,
    speakers: `Topics (pick most relevant NOT yet covered): brand preference (Sonos / Bose / KEF / Klipsch / Q Acoustics / Yamaha / Denon / Focal / Monitor Audio — offer as options), use case (desktop nearfield / home theatre / portable), powered vs passive, connectivity (Bluetooth/WiFi/AirPlay/wired), room size, stereo pair vs soundbar vs surround, bass (subwoofer needed?), streaming platform integration. NOTE: Sonos vs KEF have very different ecosystems.`,
    tripod: `Topics: brand preference (Manfrotto / Peak Design / Joby / Really Right Stuff / Gitzo / Vanguard / K&F Concept), camera weight to support, primary use (travel/studio/video), height range, head type (ball/pan-tilt/fluid video head), material (aluminium/carbon fibre), travel folded length, quick release standard (Arca-Swiss/proprietary), centre column (yes/no).`,
    'camera-flash': `Topics: camera brand for TTL compatibility (Canon/Nikon/Sony/Fuji), flash brand preference (Godox / Profoto / Flashpoint / Canon / Nikon / Sony), indoor vs outdoor primary use, guide number (power) needed, high-speed sync (HSS), wireless trigger system, battery type (AA/lithium), modifiers and accessories needed.`,
    'camera-storage': `Topics: camera model and brand (determines compatible card slot), card format needed (UHS-I SD / UHS-II SD / CFexpress Type A / CFexpress Type B / XQD), capacity (64GB/128GB/256GB/512GB), brand preference (Sony / Lexar / SanDisk / ProGrade / Delkin), minimum write speed needed for your video resolution, how many cards.`,
    'field-monitor': `Topics: brand preference (Atomos Shinobi / SmallHD / Lilliput / Feelworld / Portkeys), screen size (5"/7"/10"+), resolution (HD/Full HD/4K), camera connection (HDMI/SDI/both), outdoor brightness (nits), battery system compatibility, waveform/vectorscope/false colour need, recording capability (for Atomos Ninja etc.), touchscreen.`,
    microphone: `Topics (pick most relevant NOT yet covered): brand preference (Rode / Sennheiser / Audio-Technica / Shure / DJI Mic / Sony / Deity — offer as options), primary use (vlogging/podcast/interview/streaming/music recording), form factor (on-camera shotgun/boom/desk condenser/lavalier/wireless), connection (USB/XLR/3.5mm/wireless), environment (indoor studio/outdoor/noisy location), polar pattern. NOTE: Rode vs Shure vs DJI have very different product lines.`,
    'camera-filter': `Topics: filter thread diameter (mm — ask exact number e.g. 77mm/82mm), brand preference (NiSi / Kase / Haida / B+W / Breakthrough / Tiffen / Hoya), filter type (ND/circular polariser/UV/graduated ND/mist diffusion), ND strength, system type (screw-on individual / 100mm square system), optical quality tier (budget/pro), material (glass/resin), coating (multi-coated?).`,
    'jewelry-rings':    JEWELRY_TOPICS('ring', 'ring size, stone shape (round/oval/cushion/emerald cut), band width, stackable or solo'),
    'jewelry-necklace': JEWELRY_TOPICS('necklace', 'chain length (inches), pendant size, layering style, clasp type'),
    'jewelry-earrings': JEWELRY_TOPICS('earrings', 'earring back type (push-back/screw-back/huggie), size, for pierced or clip-on'),
    'jewelry-bracelet': JEWELRY_TOPICS('bracelet', 'wrist size, clasp type, adjustable or fixed, stackable'),
    'jewelry-watch':    `Possible topics: movement type (automatic/quartz/manual), case diameter (mm), case material (steel/gold/titanium), dial colour, strap type (leather/bracelet/rubber), water resistance, brand (Rolex/Omega/Tudor/Seiko/Longines etc.), complications needed (date/chronograph), new vs pre-owned, investment potential. Deep dive into brand reputation using community reviews.`,
    'jewelry-brooch':   JEWELRY_TOPICS('brooch', 'size, pin back strength, vintage vs modern style'),
    'jewelry-anklet':   JEWELRY_TOPICS('anklet', 'ankle circumference, clasp type, adjustable or fixed'),
  };

function JEWELRY_TOPICS(type, extras) {
  return `Possible topics: metal type (9k/14k/18k yellow gold, white gold, rose gold, sterling silver, platinum), gemstone (diamond/ruby/sapphire/no stone), brand preference (Tiffany/Cartier/Pandora/local jeweler/no preference), quality tier (fashion/fine/luxury), occasion (everyday/special/gift), style (classic/minimalist/vintage/statement), hallmark/certification importance (GIA/IGI), who it is for (self/partner/gift), ${extras}. For Deep Dive: ask about brand reputation research — community reviews from r/Jewelry, r/EngagementRings, Trustpilot for the jeweler.`;
}

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
1. Ask about EXACTLY ONE thing — never two specs in one question
2. Do NOT repeat or rephrase any already-covered topic
3. Adapt to the user's answers (work laptop → no gaming questions; AMD GPU → show AMD AIB partners only)
4. For Deep Dive: ask for exact values (16GB vs 32GB RAM, not "how much RAM generally")
5. ALWAYS include "No preference" as the last option for option questions
6. Brand/manufacturer often matters (ASUS vs MSI for GPUs, Sony vs Bose for headphones) — ask it early when relevant
7. When showing brand options, use real brand names and specific product lines (e.g. "ASUS ROG Strix", not just "ASUS")

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

  const isJewelry = category.startsWith('jewelry-');
  const jewelryNote = isJewelry
    ? `Include 2 brand-reputation queries: "[brand name] jewelry review reddit quality" and "best [jewelry type] brands [country] 2024".`
    : '';

  const prompt = `You are a shopping expert for ${category}.
User needs:
${context}

Generate ${isVague ? 4 : 6} search queries. Mix:
1. Product discovery: "best [specific type] [year]" review/roundup
2. Shopping: "[product] buy ${country || 'online'}"${budget ? ` under ${budget}` : ''}
3. ${isJewelry ? 'Brand reputation: "[brand] jewelry review quality reddit"' : `Price: "[product] price ${country || ''} ${budget || ''}"` }

${regionRetailers}
${jewelryNote}
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

  const isJewelry = category.startsWith('jewelry-');
  const jewelryExtra = isJewelry
    ? `- For jewelry: communityNote MUST reference brand reputation from the r/Jewelry, r/EngagementRings or similar communities if found. Note hallmarking, resale value, and craftmanship reputation.`
    : '';

  // Trim raw results to reduce tokens — keep only url, title, content snippet
  const trimmedResults = rawResults.slice(0, 12).map(r => ({
    url: r.url,
    title: r.title,
    content: r.content?.slice(0, 300),
  }));

  const prompt = `You are a shopping expert for ${category}.

User: ${context}
${budgetRule} ${regionRule} ${feedbackNote}

Search results:
${JSON.stringify(trimmedResults)}

Images: ${images.slice(0, 8).join('\n')}

Return ${targetCount} products as JSON array. Rules:
- Group same model variants (different configs) into ONE entry with a variants array
- URL: retailer product pages only (not review sites)
- Price: only if explicitly in results, else "Check price"
- imageUrl: best match from images or null
- Extract community sentiment from results
${jewelryExtra}

[{"name":"...","variants":[{"config":"...","price":"...","url":"..."}],"url":"...","imageUrl":null,"reason":"2 sentences.","pros":["..."],"cons":["..."],"communityNote":"...","specs":["..."],"score":95}]
No markdown.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  return safeParseArray(text);
}

// Gracefully handle truncated JSON — extract all complete product objects
function safeParseArray(text) {
  // Try clean parse first
  const fullMatch = text.match(/\[[\s\S]*\]/);
  if (fullMatch) {
    try { return JSON.parse(fullMatch[0]); } catch {}
  }
  // Response was truncated — pull out each complete {...} object individually
  const objects = [];
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try { objects.push(JSON.parse(text.slice(start, i + 1))); } catch {}
        start = -1;
      }
    }
  }
  if (objects.length > 0) return objects;
  throw new Error('Could not parse product results — please try again.');
}

// --- STREAMING RANK AND FORMAT ---
// Same prompt as rankAndFormatResults but streams each product as soon as Claude writes it

export async function rankAndFormatResultsStreaming({ category, mode, previousQA, rawResults, images = [], feedback = null, country, stores, onProduct }) {
  const isVague = mode === 'vague';
  const targetCount = isVague ? 10 : 7;
  const context = previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
  const budget = extractBudget(previousQA);

  const budgetRule = budget && budget !== 'No preference'
    ? `STRICT BUDGET: "${budget}" — exclude products clearly over this budget.` : '';
  const regionRule = country && country !== 'United States'
    ? `REGION: User is in ${country}. Prefer local retailers (${stores || country}).` : '';
  const feedbackNote = feedback ? `User feedback: "${feedback}" — prioritise this.` : '';
  const isJewelry = category.startsWith('jewelry-');
  const jewelryExtra = isJewelry
    ? `- communityNote MUST reference brand reputation from jewellery communities if found.` : '';

  const trimmedResults = rawResults.slice(0, 12).map(r => ({
    url: r.url, title: r.title, content: r.content?.slice(0, 300),
  }));

  const prompt = `You are a shopping expert for ${category}.
User: ${context}
${budgetRule} ${regionRule} ${feedbackNote}
Search results: ${JSON.stringify(trimmedResults)}
Images: ${images.slice(0, 8).join('\n')}

Return ${targetCount} products as a JSON array. Each product on its own object. Rules:
- Group same model variants into ONE entry with a variants array
- URL: retailer product pages only
- Price: only if explicitly in results, else "Check price"
- imageUrl: best match from images or null
- Extract community sentiment from results
${jewelryExtra}

[{"name":"...","variants":[{"config":"...","price":"...","url":"..."}],"url":"...","imageUrl":null,"reason":"2 sentences.","pros":["..."],"cons":["..."],"communityNote":"...","specs":["..."],"score":95}]
No markdown.`;

  const stream = getClient().messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 5500,
    messages: [{ role: 'user', content: prompt }],
  });

  let buffer = '';
  let depth = 0;
  let objectStart = -1;
  const products = [];

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const newText = event.delta.text;
      const scanFrom = buffer.length;
      buffer += newText;

      for (let i = scanFrom; i < buffer.length; i++) {
        const c = buffer[i];
        if (c === '{') {
          if (depth === 0) objectStart = i;
          depth++;
        } else if (c === '}') {
          depth--;
          if (depth === 0 && objectStart >= 0) {
            try {
              const product = JSON.parse(buffer.slice(objectStart, i + 1));
              if (product.name) {
                products.push(product);
                onProduct(product);
              }
            } catch { /* incomplete or invalid, skip */ }
            objectStart = -1;
          }
        }
      }
    }
  }

  return products;
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
