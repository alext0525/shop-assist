# ShopAssist — Project Context

> Last updated: 2026-05-23  
> For a fresh Claude instance to continue work without asking questions.

---

## What We Built

A full-stack AI shopping assistant web app. Users pick a product category, choose between a quick (3-question) or deep (12-question) flow, answer adaptive questions one at a time, then receive AI-ranked product recommendations sourced from live web search.

**Live URL:** `https://shop-assist.up.railway.app`  
**GitHub:** `github.com/alext0525/shop-assist` (private)  
**Local path:** `C:\Software\Shop_Assist`  
**Owner:** Alex (alext0525@gmail.com)

### Core flow
1. Category page (search bar + grouped horizontal scroll rows) → pick a category
2. If Jewellery or Headphones → subcategory picker
3. Mode picker → Quick Match (3 Qs, top 10) or Deep Dive (12 Qs, top 7)
4. Optional prelude input (free-text brief for the AI)
5. One question at a time (adaptive, Claude Haiku) → user answers with multi-select or free text
6. On finish → **streams** results: Tavily searches + Claude Sonnet ranks, products appear one by one via SSE
7. Results page: product cards with images, community opinions, compare, AI refinement chat

---

## Deployment

**Railway deploys automatically from GitHub.** Every `git push` to `origin/main` triggers Railway to:
1. Run `npm run build` (installs deps + builds React into `client/dist/`)
2. Run `npm start` (Express serves the dist + handles API calls)

So the live site always reflects whatever is on `origin/main`. Changes only go live after a push.

**Local dev:**
```powershell
cd "C:\Software\Shop_Assist"
npm run dev   # server on :3001 + client on :5173
```

**Railway Variables (must be set manually — lost if project is recreated):**
- `ANTHROPIC_API_KEY`
- `TAVILY_API_KEY`
- `NODE_ENV=production`
- Region: `eu-west`

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite 8 | Fast builds, easy to extend |
| Styling | Tailwind CSS v4 + CSS variables | Custom theme system (dark/light) |
| Backend | Node.js + Express (ESM) | Simple, deployable anywhere |
| AI questions | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Fast, cheap for 1-at-a-time question gen |
| AI ranking | Claude Sonnet 4.6 (`claude-sonnet-4-6`) | Quality ranking with streaming support |
| Web search | Tavily API (`basic` depth, 3 results/query, max 6 queries) | AI-optimized search with images |
| Exchange rates | `api.frankfurter.app` (free, no key) | Live USD→local currency conversion |
| IP detection | `ipwho.is` → `ipapi.co` → `freeipapi.com` (fallbacks) | Region auto-detect |
| Hosting | Railway (deploy from GitHub, auto on push) | Free tier, EU region |

---

## Project Structure

```
C:\Software\Shop_Assist\
├── .env                          # API keys (gitignored)
├── .gitignore
├── package.json                  # Root: concurrently dev, build+start for Railway
├── CONTEXT.md                    # This file — update at end of every session
├── server/
│   ├── package.json              # type: module, Express + Anthropic SDK
│   ├── server.js                 # Express app, serves React build in production
│   ├── routes/
│   │   ├── chat.js               # POST /api/chat/next-question
│   │   └── search.js             # POST /api/search/products/stream (SSE)
│   │                             # POST /api/search/products (non-streaming fallback)
│   │                             # POST /api/search/refine
│   └── services/
│       ├── claude.js             # All Claude API logic
│       └── tavily.js             # Web search (parallel queries, dedup)
└── client/
    ├── vite.config.js            # Proxy /api → localhost:3001 in dev
    ├── src/
    │   ├── App.jsx               # Stage machine + streaming state
    │   ├── index.css             # CSS variables, animations, dark/light theme
    │   ├── fetchJSON.js          # fetch wrapper with error handling
    │   ├── streamSearch.js       # SSE client for streaming products
    │   ├── i18n.js               # All UI translations (10 languages)
    │   ├── hooks/
    │   │   └── useCurrency.js    # IP detection, exchange rates, convertPrice()
    │   └── components/
    │       ├── Header.jsx
    │       ├── CategorySelector.jsx   # 48-category grid + search
    │       ├── SubcategorySelector.jsx
    │       ├── ModeSelector.jsx
    │       ├── PreludeInput.jsx       # Optional free-text brief before questions
    │       ├── QuestionFlow.jsx
    │       ├── ProductResults.jsx     # Handles streaming state
    │       ├── ResultsChat.jsx        # AI refinement chat
    │       ├── CompareModal.jsx
    │       └── RegionModal.jsx
```

---

## All 48 Categories

Defined in `client/src/components/CategorySelector.jsx` → `ALL_CATEGORIES` array.

| ID | Label | Group |
|---|---|---|
| `action-camera` | Action Camera | Camera |
| `air-fryer` | Air Fryer | Home |
| `backpack` | Backpack | Sports |
| `bike` | Bike | Sports/Transport |
| `blender` | Blender | Home |
| `camera-filter` | Cam Filter | Camera |
| `camera-flash` | Cam Flash | Camera |
| `camera-storage` | Cam Storage | Camera |
| `coffee-machine` | Coffee Machine | Home |
| `cpu` | CPU | PC |
| `cpu-cooler` | CPU Cooler | PC |
| `dash-cam` | Dash Cam | Transport |
| `e-reader` | E-Reader | Mobile |
| `electric-razor` | Electric Razor | Lifestyle |
| `electric-scooter` | Electric Scooter | Sports/Transport |
| `electric-toothbrush` | Electric Toothbrush | Lifestyle |
| `field-monitor` | Field Monitor | Camera |
| `gaming-console` | Console | Popular |
| `gpu` | Graphics Card | PC |
| `hair-dryer` | Hair Dryer | Lifestyle |
| `headphones` | Headphones | Audio |
| `jewelry` | Jewellery | Fashion |
| `keyboard` | Keyboard | PC |
| `laptop` | Laptop | PC/Popular |
| `microphone` | Microphone | Audio/Camera |
| `monitor` | Monitor | PC |
| `motherboard` | Motherboard | PC |
| `mouse` | Mouse | PC |
| `office-chair` | Office Chair | Home |
| `pc-case` | PC Case | PC |
| `portable-charger` | Power Bank | Mobile |
| `printer` | Printer | PC/Lifestyle |
| `projector` | Projector | Home |
| `psu` | Power Supply | PC |
| `ram` | RAM | PC |
| `robot-vacuum` | Robot Vacuum | Home |
| `running-shoes` | Running Shoes | Sports |
| `security-camera` | Security Camera | Home |
| `smart-speaker` | Smart Speaker | Audio/Home |
| `smartphone` | Smartphone | Mobile/Popular |
| `smartwatch` | Smartwatch | Mobile |
| `speakers` | Speakers | Audio |
| `ssd` | SSD | PC |
| `standing-desk` | Standing Desk | Lifestyle |
| `tablet` | Tablet | Mobile |
| `tripod` | Tripod | Camera |
| `tv` | TV | Home/Popular |
| `vacuum-cleaner` | Vacuum Cleaner | Home |
| `webcam` | Webcam | PC |
| `air-purifier` | Air Purifier | Home |

Jewellery subcategories: `jewelry-rings`, `jewelry-necklace`, `jewelry-earrings`, `jewelry-bracelet`, `jewelry-watch`, `jewelry-brooch`, `jewelry-anklet`  
Headphones subcategories: defined in `SubcategorySelector.jsx`

---

## 10 Supported Languages (UI)

All in `client/src/i18n.js`. Language is independent of region — user sets them separately in the Region modal.

| Code | Language | Flag |
|---|---|---|
| `en` | English | 🇬🇧 |
| `nl` | Nederlands | 🇳🇱 |
| `de` | Deutsch | 🇩🇪 |
| `fr` | Français | 🇫🇷 |
| `es` | Español | 🇪🇸 |
| `it` | Italiano | 🇮🇹 |
| `pl` | Polski | 🇵🇱 |
| `sv` | Svenska | 🇸🇪 |
| `nb` | Norsk | 🇳🇴 |
| `da` | Dansk | 🇩🇰 |

---

## 17 Supported Regions

NL (EUR, bol.com/coolblue.nl), DE (EUR, amazon.de), FR (EUR, amazon.fr), BE (EUR, bol.com), ES (EUR, amazon.es), IT (EUR, amazon.it), PL (PLN, allegro.pl/x-kom.pl), GB (GBP, amazon.co.uk/currys.co.uk), US (USD, amazon.com/bestbuy.com), CA (CAD, amazon.ca), AU (AUD, jbhifi.com.au), CH (CHF, digitec.ch), SE (SEK, elgiganten.se), NO (NOK, komplett.no), DK (DKK, proshop.dk), JP (JPY, amazon.co.jp), SG (SGD, amazon.sg)

---

## API Endpoints

### `POST /api/chat/next-question`
```json
{ "category": "laptop", "mode": "specific", "previousQA": [...],
  "currencyCode": "EUR", "currencySymbol": "€", "currencyRate": 1 }
// Response
{ "done": false, "question": "How much RAM?", "options": ["8 GB", "16 GB", ...] }
// or { "done": true }
```

### `POST /api/search/products/stream` — SSE
```
event: status   → { "label": "Searching the web…" }
event: summary  → { "marketSummary": "…" }
event: product  → { "name": "…", "variants": […], "url": "…", "pros": […], … }
event: done     → {}
```

### `POST /api/search/refine`
```json
{ "category": "laptop", "originalQA": [...], "currentProducts": [...],
  "feedback": "show me lighter options", "country": "Netherlands", "stores": "bol.com" }
// Response: { "message": "…", "products": [...] }
```

---

## Key Design Decisions

### Streaming via SSE
Products stream one by one as Claude writes them (bracket-depth parser). First product appears in ~8-12s vs 45-60s blank wait before. App moves to RESULTS stage immediately; compare/chat disabled during streaming.

### Dark mode default
Default is dark (no class on `<html>`). Light adds `.light`. Toggle in `localStorage`. CSS variables: `:root` = dark, `.light` = overrides.

### Currency: client-side conversion
USD amounts from Claude, converted in frontend via `convertPrice()`. Budget question passes `currencyRate`/`currencySymbol` from client to show local currency in options.

### Bike type before budget
`TYPE_BEFORE_BUDGET` set in `claude.js`. Q1 asks bike type, then budget options calibrate to that type. Good candidates to extend: headphones, speakers, monitor.

### Jewellery + Headphones as parent categories
Both open `SubcategorySelector` before `ModeSelector`. The `HAS_SUBCATEGORY` set in `App.jsx` controls this.

### Prelude input
`PreludeInput.jsx` — optional free-text step between ModeSelector and QuestionFlow. User describes key requirements upfront; injected into the system prompt for all questions.

### Grouped product variants
Same model in different configs → one entry with `variants: [{ config, price, url }]`. ProductCard shows variant buttons.

### JSON truncation recovery
`safeParseArray()` first tries full JSON parse, falls back to bracket-depth extraction of complete `{...}` objects.

### Brands in topic guides
Each category has a `topicGuides` entry in `claude.js` with explicit brand names. Prevents vague "any brand preference?" questions.

---

## Code Conventions

- **ESM everywhere** — both server and client use `import/export`
- **CSS variables for theming** — never hardcode colours; use `var(--*)` from `index.css`
- **Inline styles for dynamic values** — Tailwind for layout/spacing
- **No TypeScript** — plain JS throughout
- **No external animation library** — CSS keyframes in `index.css`: `anim-fadeup`, `anim-fadein`, `anim-slidein`, `anim-scaleup`, stagger classes `stagger-1` through `stagger-6`
- **Claude models** — Haiku for fast/cheap (questions, refinement planning), Sonnet for quality (ranking). Never Opus.
- **Error handling** — server routes return `{ error: message }`. Client throws errors that bubble to component state. Never `alert()`.

---

## Open Issues / Known Bugs

### High priority
1. **Wrong prices / sold-out products** — Tavily is not a shopping API. Prices from snippets are often outdated. Mitigation: disclaimer banner. Real fix: shopping API (Google Shopping via SerpAPI, bol.com Partner API, Amazon PAAPI).
2. **Links sometimes go to review pages** — Claude instructed to prefer retailer URLs but can't always find them in Tavily results.
3. **Currency auto-detection sometimes returns USD in EU** — Three IP API fallbacks help. Manual region selector in header as override (stored in `localStorage` as `shopregion`).

### Medium priority
4. **Images often missing or wrong** — Tavily images matched by domain similarity. No dedicated product image API.
5. **JSON truncation on large result sets** — `max_tokens: 5500` for ranking can still drop last 1-2 products. `safeParseArray()` recovers partial results.
6. **Streaming not supported in ResultsChat refinement** — `/refine` endpoint is non-streaming. Long wait during refinement.

### Low priority
7. **Compare modal is string-based** — Specs are free-text pills, not a structured feature matrix.
8. **No user accounts / history** — Stateless, each session starts fresh.

---

## Next Steps (priority order)

1. **Shopping API integration** — Real retailer pricing/availability. Options: SerpAPI Google Shopping (~$50/mo), bol.com Partner API (free), Amazon PAAPI (affiliate). Short-term: second Tavily search `"[product name] buy [country]"` after ranking.
2. **Stream the refinement chat** — `/refine/stream` endpoint in `search.js`, replace `fetchJSON` in `ResultsChat.jsx` with `streamSearch`.
3. **Product history (localStorage)** — Last 5 searches. "Recent searches" section on category page.
4. **Extend `TYPE_BEFORE_BUDGET`** — Add headphones, speakers, monitor. Pattern in `claude.js`: add to set, add `TYPE_QUESTION`, add per-subtype budget ranges.
5. **More categories** — Needs entries in `CATEGORY_CONTEXT`, `BUDGET_RANGES`, `topicGuides` in `claude.js`, plus `ALL_CATEGORIES` in `CategorySelector.jsx`, labels in `ModeSelector.jsx`/`QuestionFlow.jsx`.
6. **Mobile UI polish** — Swipeable carousel for results, question progress previews.

---

## Session Log

| Date | What was done |
|---|---|
| 2026-05-17 | Initial context captured. 10 languages (DE/FR/NL/ES/IT/PL/SV/NB/DA). Grew to 48 categories. PreludeInput added. Headphones subcategory added. |
| 2026-05-23 | Verified project state. Corrected CONTEXT.md (was showing 22 cats, actual is 48). Fixed local path (was C:\Software\Claude\Shopping, now C:\Software\Shop_Assist). Added Stop hook in ~/.claude/settings.json to remind updating this file each session. Confirmed German already live on Railway. Fixed directory write permissions for user alext. Added Webcam and Air Purifier (now 50 categories). |
