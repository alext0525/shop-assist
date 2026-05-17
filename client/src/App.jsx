import { useState, useEffect } from 'react';
import { streamSearch } from './streamSearch';
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
  RESULTS: 'results',
};

const HAS_SUBCATEGORY = new Set(['jewelry']);

export default function App() {
  const [stage, setStage] = useState(STAGES.CATEGORY);
  const [category, setCategory] = useState(null);
  const [mode, setMode] = useState(null);
  const [products, setProducts] = useState([]);
  const [marketSummary, setMarketSummary] = useState('');
  const [allQA, setAllQA] = useState([]);
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const { region, setRegion, convertPrice } = useCurrency();

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function handleCategorySelect(cat) {
    setCategory(cat);
    setStage(HAS_SUBCATEGORY.has(cat) ? STAGES.SUBCATEGORY : STAGES.MODE);
  }

  async function handleQuestionsComplete(qa) {
    setAllQA(qa);
    setProducts([]);
    setMarketSummary('');
    setError(null);
    setStreaming(true);
    setSearchStatus('Searching the web…');
    setStage(STAGES.RESULTS); // go to results immediately — products trickle in

    try {
      await streamSearch({
        url: '/api/search/products/stream',
        body: { category, mode, previousQA: qa, country: region.country, countryCode: region.code, stores: region.stores },
        onStatus:  ({ label }) => setSearchStatus(label),
        onSummary: ({ marketSummary }) => setMarketSummary(marketSummary),
        onProduct: (product) => setProducts(prev => [...prev, product]),
        onDone:    () => setStreaming(false),
        onError:   ({ message }) => { setError(message); setStreaming(false); },
      });
    } catch (err) {
      setError(err.message);
      setStreaming(false);
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
    setStreaming(false);
    setSearchStatus('');
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
            streaming={streaming}
            searchStatus={searchStatus}
          />
        )}
      </main>
    </div>
  );
}
