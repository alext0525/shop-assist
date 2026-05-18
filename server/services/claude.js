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
  // PC parts
  cpu:            'desktop processors, Intel Core i5/i7/i9 Ultra, AMD Ryzen 5/7/9, gaming CPUs, workstation CPUs, overclocking',
  motherboard:    'ATX motherboards, mATX micro-ATX, Mini-ITX, Intel LGA1851/LGA1700, AMD AM5/AM4, gaming motherboards, overclocking boards',
  ram:            'DDR5 RAM, DDR4 RAM, gaming memory kits, desktop DIMM modules, XMP EXPO overclocking',
  ssd:            'NVMe SSD M.2 PCIe Gen 4 Gen 5, SATA SSD 2.5 inch, internal storage, fast game storage, OS drive',
  psu:            'PC power supply units, ATX 3.1, fully modular semi-modular, 80 Plus Gold Platinum Titanium, PCIe 5.0',
  'pc-case':      'PC cases, mid-tower ATX, full tower, mATX, Mini-ITX, tempered glass, airflow mesh cases',
  'cpu-cooler':   'CPU coolers, tower air coolers, AIO all-in-one liquid coolers, 240mm 360mm radiators, low-profile coolers',
  // Headphone subcategories
  'headphones-over-ear':  'over-ear circumaural headphones, closed-back, open-back, planar magnetic, studio headphones, ANC noise-cancelling',
  'headphones-tws':       'true wireless earbuds TWS, AirPods, Galaxy Buds, wireless earbuds, ANC earbuds, open-fit earbuds',
  'headphones-in-ear':    'wired in-ear monitors IEM, audiophile earphones, chi-fi IEM, dynamic driver, balanced armature, planar IEM',
  'headphones-on-ear':    'on-ear supra-aural headphones, portable wireless headphones, foldable compact headphones',
  'headphones-gaming':    'gaming headsets, PC gaming headsets, PS5 headsets, Xbox headsets, wireless gaming headsets, surround sound',
  // Kitchen
  'air-fryer':    'air fryers, compact air fryer, family air fryer, dual basket air fryer, air fryer oven, convection countertop oven',
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
  // PC parts
  cpu:                [150, 250, 400, 600],
  motherboard:        [100, 200, 350],
  ram:                [50, 100, 200],
  ssd:                [50, 100, 200],
  psu:                [60, 110, 180],
  'pc-case':          [50, 100, 200],
  'cpu-cooler':       [30, 70, 150],
  // Headphone subcategories
  'headphones-over-ear':  [50, 150, 350],
  'headphones-tws':       [30, 80, 180],
  'headphones-in-ear':    [30, 80, 200, 500],
  'headphones-on-ear':    [30, 80, 200],
  'headphones-gaming':    [50, 100, 200, 350],
  // Kitchen
  'air-fryer':            [50, 100, 200],
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
    // PC parts
    cpu: `Topics (pick most relevant NOT yet covered): chip maker (Intel Core Ultra vs AMD Ryzen — ask first with options), existing motherboard socket (LGA1851 Intel Arrow Lake / LGA1700 Intel Alder/Raptor Lake / AM5 AMD Ryzen 7000/9000 / AM4 — crucial for compatibility), use case (gaming / content creation & video editing / 3D rendering / workstation / streaming), core & thread count needed (6/8/12/16/24 cores), clock speed priorities (high single-core for gaming / many cores for multi-threaded), TDP and power budget (65W / 105W / 125W / 170W+), overclocking (K-series Intel / standard AMD Ryzen), integrated graphics needed (for systems without a discrete GPU), specific game or workload that stresses the CPU, cache preference (AMD 3D V-Cache for gaming). NOTE: Intel vs AMD is a fundamental fork — ask early.`,
    motherboard: `Topics (pick most relevant NOT yet covered): CPU socket (LGA1851 Intel Arrow Lake / LGA1700 Intel Raptor/Alder Lake / AM5 AMD Ryzen 7000+ / AM4 — ask first, must match CPU), form factor (ATX / mATX Micro-ATX / Mini-ITX), chipset tier (Intel: B760 value / Z790 mid / Z890 high-end; AMD: B650 value / X670 overclocking / X870 latest), brand preference (ASUS ROG Strix/TUF Gaming/Prime / MSI MAG/MEG Ace/Godlike / Gigabyte AORUS Elite/Master / ASRock Taichi/Steel Legend — offer as options), VRM quality for overclocking or high-TDP CPUs, number of M.2 NVMe slots needed, PCIe 5.0 x16 slot, built-in Wi-Fi 6E/7 and Bluetooth, USB-C rear port, RAM speed support (DDR5 6000+ MHz), BIOS ease and update support.`,
    ram: `Topics (pick most relevant NOT yet covered): DDR generation (DDR4 vs DDR5 — determined by motherboard: AM5 and LGA1851 require DDR5; LGA1700/AM4 use DDR4), total capacity (16GB / 32GB / 64GB / 128GB), kit configuration (2×8GB / 2×16GB / 2×32GB — always run dual channel, not single), speed/frequency (DDR4: 3200/3600MHz; DDR5: 5600/6000/6400/7200MHz), CAS latency (lower = better: CL30 at 6000MHz DDR5 is ideal), XMP 3.0 or EXPO profile support, RGB preference, brand (Corsair Vengeance DDR5/Dominator Titanium / G.Skill Trident Z5/Ripjaws S5 / Kingston Fury Beast/Renegade / TeamGroup T-Force Delta / Crucial Pro — offer as options).`,
    ssd: `Topics (pick most relevant NOT yet covered): interface (M.2 NVMe PCIe 4.0 — best value / M.2 NVMe PCIe 5.0 — fastest / M.2 SATA / 2.5" SATA — check motherboard M.2 slots), capacity (500GB / 1TB / 2TB / 4TB), primary use (OS & apps boot drive / game library storage / video editing scratch / cold backup), sequential read/write speed requirements (PCIe 4.0: ~7000MB/s; PCIe 5.0: ~12000MB/s; SATA: ~550MB/s), TBW endurance (for heavy write workloads), heat sink included or does case/board provide one, brand (Samsung 990 Pro / WD Black SN850X / Seagate FireCuda 530 / Crucial T705 / Kingston KC3000 / Corsair MP700 Pro — offer as options), DRAM cache included (vs DRAMless for budget).`,
    psu: `Topics (pick most relevant NOT yet covered): wattage (calculate from GPU TDP + ~200W for rest: 650W / 750W / 850W / 1000W / 1200W+; RTX 4090/5090 need 1000W+), 80 Plus rating (Bronze reliable budget / Gold best value / Platinum/Titanium premium efficiency), modular type (fully modular cleanest cable management / semi-modular compromise / non-modular budget), ATX 3.1 standard and native 12V-2×6 connector (required for RTX 40/50 series GPUs without adapters), brand reliability (Corsair RM Series/HX Series / Seasonic Focus GX/Prime TX / be quiet! Pure Power 12M/Straight Power 12 / EVGA Supernova / Fractal Ion+ / Phanteks Revolt — offer as options), warranty length (5yr/10yr indicates quality), fan noise at load.`,
    'pc-case': `Topics (pick most relevant NOT yet covered): motherboard form factor support (ATX full-size / mATX Micro-ATX / Mini-ITX — ask first), case size class (full tower / mid tower — most common / small form factor SFF), GPU length clearance (mm — important for large cards like RTX 4090), airflow design (mesh front/top for max airflow / solid panel with glass for aesthetics), AIO radiator support (240/280/360mm — and position: top/front), included fan count, front panel I/O (USB-C, USB 3.0 count), PSU shroud, brand (Fractal Design Define 7/North/Torrent / Lian Li Lancool III/PC-O11 Dynamic / NZXT H7/H9 / Corsair 4000D Airflow / Phanteks Eclipse G500A / be quiet! Pure Base 500DX / Cooler Master HAF / Thermaltake View — offer as options), tool-less drive installation.`,
    'cpu-cooler': `Topics (pick most relevant NOT yet covered): cooler type (tower air cooler — quiet value / AIO liquid 240mm — popular / AIO 280mm / AIO 360mm — maximum cooling — ask first), CPU socket compatibility (LGA1851/LGA1700 Intel / AM5/AM4 AMD — must match), CPU TDP to handle (65W stock / 105W mid / 125W high-end / 170W+ flagship), case height clearance for air coolers (mm), radiator mounting location (top preferred / front / side), RGB, noise level at load, brand (Noctua NH-D15 G2/NH-U12A — best air / be quiet! Dark Rock Pro 5/Shadow Rock 3 / Deepcool AK620/AK500 / Arctic Liquid Freezer III 360 — best AIO value / Corsair iCUE H150i/H170i / NZXT Kraken Elite / Thermalright Peerless Assassin / EK Nucleus — offer as options).`,
    // Headphone subcategories
    'headphones-over-ear': `Topics (pick most relevant NOT yet covered): open-back vs closed-back (open = wide soundstage for home use / closed = isolation for commute/recording), wired vs wireless, ANC noise cancellation quality (Sony WH vs Bose QC vs Apple AirPods Max), microphone for calls, codec (LDAC/aptX HD for hi-res wireless / AAC for iPhone), use environment (commute / home listening / studio monitoring / office), brand preference (Sony WH-1000XM5 / Bose QuietComfort Ultra / Apple AirPods Max / Sennheiser Momentum 4 / Beyerdynamic DT 700 Pro X / Audio-Technica ATH-M50x / Focal Elear / Audeze LCD — offer as options), driver type for hi-fi (dynamic / planar magnetic), impedance (32Ω wireless-friendly / 250Ω needs amp), comfort for extended wear.`,
    'headphones-tws': `Topics (pick most relevant NOT yet covered): ANC quality (active noise cancellation — key differentiator), transparency/passthrough mode, total battery life (buds alone / with case recharges), charging type (USB-C + wireless Qi), fit style (silicone ear tip seal / open-fit no seal / ear hook sport), call microphone quality, codec (LDAC Android hi-res / AAC Apple / aptX / SBC), spatial audio (Dolby Atmos / Apple Spatial), platform ecosystem (iPhone → AirPods Pro 2; Android → Sony/Samsung/Nothing), brand (Apple AirPods Pro 2 / Samsung Galaxy Buds3 Pro / Sony WF-1000XM5 / Jabra Elite 10 / Bose QuietComfort Ultra Earbuds / Nothing Ear (open) / Soundcore Liberty 4 Pro / Shokz OpenFit — offer as options), IP water resistance rating (IPX4/IPX5), in-ear vs open-fit preference.`,
    'headphones-in-ear': `Topics (pick most relevant NOT yet covered): driver type (single dynamic driver — warm natural / balanced armature BA — detailed analytical / planar magnetic — technical / hybrid multi-driver — versatile — ask first), tuning signature preference (V-shaped / neutral/reference / warm / bright), cable termination (3.5mm single-ended / 4.4mm balanced / 2.5mm balanced), cable connector type (2-pin 0.78mm / MMCX — allows cable upgrades), source device (phone / DAP / DAC-amp), brand (Moondrop Aria 2/Blessing 3 / 7Hz Salnotes Zero 2 / Shure SE215/SE846 / Etymotic ER2XR / ThieAudio Hype / Truthear Zero Red / Letshuoer S12 Pro / Campfire Audio Andromeda — offer as options), impedance and sensitivity (for pairing with source), use case (commute vs critical listening vs studio monitoring).`,
    'headphones-on-ear': `Topics (pick most relevant NOT yet covered): wired vs wireless, ANC or passive isolation, foldable/portable priority, use case (commute / casual / gym), brand (Marshall Major IV / Skullcandy Hesh / Jabra Move / JBL Club / Urbanears Plattan / Sony MDR-ZX770BN — offer as options), battery life wireless, sound signature (bass-heavy / balanced), call microphone, comfort of on-ear pad material.`,
    'headphones-gaming': `Topics (pick most relevant NOT yet covered): platform (PC / PlayStation 5 / Xbox Series / Nintendo Switch / multi-platform — ask first, affects compatibility), connection (wired 3.5mm / USB / wireless 2.4GHz dongle — best latency / Bluetooth), virtual surround sound (Dolby Atmos / DTS Headphone:X / THX Spatial), microphone quality (detachable boom / retractable / built-in — ask), brand (SteelSeries Arctis Nova Pro / HyperX Cloud III / Astro A50 X / Corsair HS80 / Razer BlackShark V2 / Logitech G Pro X 2 / EPOS H6PRO / Turtle Beach Stealth — offer as options), sidetone (hear own voice), comfort for long sessions (weight, headband, ear pad material), official console certification (PlayStation licensed etc.).`,
    // Kitchen
    'air-fryer': `Topics (pick most relevant NOT yet covered): household size and capacity (1-2L compact / 3-4L 1-2 people / 5-6L family of 4 / 8L+ large family — ask first), form factor (basket/drawer style — most common / oven/tray style — more versatile / dual basket — two zones simultaneously), dual zone / dual basket (cook two different foods at once — important feature for families), wattage (1400-1700W budget / 1800-2400W faster cooking), cooking presets and smart features (dial control / digital display / app/WiFi control), ease of cleaning (dishwasher-safe basket/tray, non-stick coating quality), brand (Philips Series 3000 XXL / Ninja Dual Zone AF400 / Cosori TurboBlaze / Instant Vortex Plus / Tower Vortx / Tefal Easy Fry Genius / Meross smart — offer as options), additional functions (bake/roast/dehydrate/grill beyond air fry), noise level at high heat.`,
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
  const parsed = safeParseObject(text);

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

Generate ${isVague ? 5 : 7} search queries. Mix:
1. Product discovery: "best [specific type] [year]" review/roundup
2. Shopping: "[product] buy ${country || 'online'}"${budget ? ` under ${budget}` : ''}
3. ${isJewelry ? 'Brand reputation: "[brand] jewelry review quality reddit"' : `Price: "[product] price ${country || ''} ${budget || ''}"` }
4. Manufacturer/official pages (for product images): "[brand if inferred from preferences] [product] official" or "[specific model name] specifications" — these pages have high-quality product photos

${regionRetailers}
${jewelryNote}
Return ONLY a JSON array of strings.`;

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  return safeParseFirstArray(text);
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

Images: ${images.slice(0, 20).join('\n')}

Return ${targetCount} products as JSON array. Rules:
- Group same model variants (different configs) into ONE entry with a variants array
- url: MUST be a direct retailer product page (amazon, bol.com, bestbuy, etc.) OR the manufacturer's own product page. NEVER use review/editorial/comparison sites (rtings.com, notebookcheck.net, tomsguide.com, techradar.com, gsmarena.com, pcmag.com, theverge.com, cnet.com, anandtech.com, tomshardware.com, digitaltrends.com, trustedreviews.com, soundguys.com, etc.). If no suitable URL found in results, construct a plausible manufacturer URL (e.g. "https://www.logitech.com/products/mice/mx-master-3s").
- brandUrl: the manufacturer's own product page or homepage as a fallback (e.g. "https://www.apple.com/shop/buy-iphone/iphone-15-pro" or "https://logitech.com"). Always include this field.
- Price: only if explicitly in results, else "Check price"
- imageUrl: from the Images list, prefer product photos from manufacturer CDNs, Amazon image CDNs (m.media-amazon.com, images-na.ssl-images-amazon.com), or high-resolution press images. Avoid small editorial thumbnails. null if no good match.
- Extract community sentiment from results
${jewelryExtra}

[{"name":"...","variants":[{"config":"...","price":"...","url":"..."}],"url":"https://amazon.com/dp/...","brandUrl":"https://logitech.com/products/mice/mx-master-3s","imageUrl":null,"reason":"2 sentences.","pros":["..."],"cons":["..."],"communityNote":"...","specs":["..."],"score":95}]
No markdown.`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text.trim();
  return safeParseArray(text);
}

// Robust single-object parser: finds the first valid JSON object using bracket depth
// (avoids greedy-regex failures when Claude adds preamble text containing braces)
function safeParseObject(text) {
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { start = -1; }
      }
    }
  }
  throw new Error('Could not parse JSON response from AI');
}

// Robust first-array parser: same approach for top-level arrays
function safeParseFirstArray(text) {
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '[') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === ']') {
      depth--;
      if (depth === 0 && start !== -1) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { start = -1; }
      }
    }
  }
  throw new Error('Could not parse array response from AI');
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
Images: ${images.slice(0, 20).join('\n')}

Return ${targetCount} products as a JSON array. Each product on its own object. Rules:
- Group same model variants into ONE entry with a variants array
- url: MUST be a direct retailer product page (amazon, bol.com, bestbuy, etc.) OR manufacturer's own product page. NEVER review/editorial/comparison sites (rtings.com, notebookcheck.net, tomsguide.com, techradar.com, gsmarena.com, pcmag.com, theverge.com, cnet.com, anandtech.com, tomshardware.com, digitaltrends.com, trustedreviews.com, soundguys.com, etc.). If no suitable URL in results, construct a plausible manufacturer URL (e.g. "https://www.logitech.com/products/mice/mx-master-3s").
- brandUrl: manufacturer's own product page or homepage as fallback (e.g. "https://www.samsung.com/galaxy-s24" or "https://samsung.com"). Always include this field.
- Price: only if explicitly in results, else "Check price"
- imageUrl: from the Images list, prefer product photos from manufacturer CDNs, Amazon image CDNs (m.media-amazon.com, images-na.ssl-images-amazon.com), or high-resolution press images. Avoid small editorial thumbnails. null if no good match.
- Extract community sentiment from results
${jewelryExtra}

[{"name":"...","variants":[{"config":"...","price":"...","url":"..."}],"url":"https://amazon.com/dp/...","brandUrl":"https://logitech.com/products/mice/mx-master-3s","imageUrl":null,"reason":"2 sentences.","pros":["..."],"cons":["..."],"communityNote":"...","specs":["..."],"score":95}]
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
  return safeParseObject(text);
}
