import { useState, useEffect } from 'react';
import { fetchJSON } from './fetchJSON';
import { useCurrency } from './hooks/useCurrency';
import CategorySelector from './components/CategorySelector';
import SubcategorySelector from './components/SubcategorySelector';
import ModeSelector from './components/ModeSelector';
import QuestionFlow from './components/QuestionFlow';
import ProductResults from './components/ProductResults';
import Header from './components/Header';

const STAGES = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  MODE: 'mode',
  QUESTIONS: 'questions',
  SEARCHING: 'searching',
  RESULTS: 'results',
};

// Categories that have a subcategory step
const HAS_SUBCATEGORY = new Set(['jewelry']);

export default function App() {
  const [stage, setStage] = useState(STAGES.CATEGORY);
  const [category, setCategory] = useState(null);
  const [mode, setMode] = useState(null);
  const [products, setProducts] = useState([]);
  const [marketSummary, setMarketSummary] = useState('');
  const [allQA, setAllQA] = useState([]);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  const { region, setRegion, convertPrice } = useCurrency();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function handleCategorySelect(cat) {
    setCategory(cat);
    setStage(HAS_SUBCATEGORY.has(cat) ? STAGES.SUBCATEGORY : STAGES.MODE);
  }

  async function handleQuestionsComplete(qa) {
    setAllQA(qa);
    setStage(STAGES.SEARCHING);
    setError(null);
    try {
      const data = await fetchJSON('/api/search/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, mode, previousQA: qa, country: region.country, countryCode: region.code, stores: region.stores }),
      });
      setProducts(data.products);
      setMarketSummary(data.marketSummary || '');
      setStage(STAGES.RESULTS);
    } catch (err) {
      setError(err.message);
      setStage(STAGES.QUESTIONS);
    }
  }

  function handleReset() {
    setStage(STAGES.CATEGORY);
    setCategory(null);
    setMode(null);
    setProducts([]);
    setAllQA([]);
    setMarketSummary('');
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header
        onReset={handleReset}
        showReset={stage !== STAGES.CATEGORY}
        isDark={isDark}
        setIsDark={setIsDark}
        region={region}
        setRegion={setRegion}
      />
      <main className="flex-1 flex flex-col items-center px-4 pb-24">
        {stage === STAGES.CATEGORY && (
          <CategorySelector onSelect={handleCategorySelect} />
        )}
        {stage === STAGES.SUBCATEGORY && (
          <SubcategorySelector
            onSelect={sub => { setCategory(sub); setStage(STAGES.MODE); }}
            onBack={() => setStage(STAGES.CATEGORY)}
          />
        )}
        {stage === STAGES.MODE && (
          <ModeSelector
            category={category}
            onSelect={m => { setMode(m); setStage(STAGES.QUESTIONS); }}
            onBack={() => setStage(HAS_SUBCATEGORY.has(category?.split('-')[0]) ? STAGES.SUBCATEGORY : STAGES.CATEGORY)}
          />
        )}
        {stage === STAGES.QUESTIONS && (
          <QuestionFlow
            category={category}
            mode={mode}
            region={region}
            onComplete={handleQuestionsComplete}
            onBack={() => setStage(STAGES.MODE)}
            error={error}
          />
        )}
        {stage === STAGES.SEARCHING && <SearchingState category={category} region={region} />}
        {stage === STAGES.RESULTS && (
          <ProductResults
            products={products}
            setProducts={setProducts}
            marketSummary={marketSummary}
            category={category}
            mode={mode}
            allQA={allQA}
            onReset={handleReset}
            convertPrice={convertPrice}
            region={region}
          />
        )}
      </main>
    </div>
  );
}

const SEARCH_STAGES = [
  { label: 'Searching the web…',       pct: 15, duration: 2000 },
  { label: 'Reading product pages…',   pct: 45, duration: 3000 },
  { label: 'Analysing reviews…',       pct: 70, duration: 4000 },
  { label: 'Ranking results for you…', pct: 90, duration: 99999 },
];

function SearchingState({ category, region }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Animate progress bar smoothly
    const interval = setInterval(() => setPct(p => Math.min(p + 1, SEARCH_STAGES[stageIdx]?.pct ?? 90)), 80);
    return () => clearInterval(interval);
  }, [stageIdx]);

  useEffect(() => {
    if (stageIdx >= SEARCH_STAGES.length - 1) return;
    const t = setTimeout(() => setStageIdx(i => i + 1), SEARCH_STAGES[stageIdx].duration);
    return () => clearTimeout(t);
  }, [stageIdx]);

  const LABELS = {
    'jewelry-rings': 'Rings', 'jewelry-necklace': 'Necklaces', 'jewelry-earrings': 'Earrings',
    'jewelry-bracelet': 'Bracelets', 'jewelry-watch': 'Watches', 'jewelry-brooch': 'Brooches', 'jewelry-anklet': 'Anklets',
  };
  const catLabel = LABELS[category] || (category?.replace(/-/g, ' ') ?? 'products');

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-32 w-full max-w-sm mx-auto">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
      </div>
      <div className="w-full flex flex-col gap-3 text-center">
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          {SEARCH_STAGES[stageIdx]?.label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Finding {catLabel} available in {region?.country || 'your region'}
        </p>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
          {SEARCH_STAGES.map((s, i) => (
            <span key={i} style={{ color: i <= stageIdx ? 'var(--accent)' : 'var(--text-faint)', fontWeight: i === stageIdx ? 600 : 400 }}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
