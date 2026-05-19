import { useState, useEffect } from 'react';
import { streamSearch } from './streamSearch';
import { useCurrency } from './hooks/useCurrency';
import CategorySelector from './components/CategorySelector';
import SubcategorySelector from './components/SubcategorySelector';
import ModeSelector from './components/ModeSelector';
import PreludeInput from './components/PreludeInput';
import QuestionFlow from './components/QuestionFlow';
import ProductResults from './components/ProductResults';
import Header from './components/Header';

const STAGES = {
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  MODE: 'mode',
  PRELUDE: 'prelude',
  QUESTIONS: 'questions',
  RESULTS: 'results',
};

const HAS_SUBCATEGORY = new Set(['jewelry', 'headphones']);

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
  const [userDescription, setUserDescription] = useState('');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const { region, setRegion, convertPrice, language, languageName, setLanguage } = useCurrency();

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
        body: { category, mode, previousQA: qa, userDescription, language, languageName, country: region.country, countryCode: region.code, stores: region.stores },
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
    setUserDescription('');
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
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-1 flex flex-col items-center px-4 pb-24">
        {stage === STAGES.CATEGORY && (
          <CategorySelector onSelect={handleCategorySelect} language={language} />
        )}
        {stage === STAGES.SUBCATEGORY && (
          <SubcategorySelector
            category={category}
            onSelect={sub => { setCategory(sub); setStage(STAGES.MODE); }}
            onBack={() => setStage(STAGES.CATEGORY)}
          />
        )}
        {stage === STAGES.MODE && (
          <ModeSelector
            category={category}
            language={language}
            onSelect={m => { setMode(m); setStage(STAGES.PRELUDE); }}
            onBack={() => setStage(HAS_SUBCATEGORY.has(category?.split('-')[0]) ? STAGES.SUBCATEGORY : STAGES.CATEGORY)}
          />
        )}
        {stage === STAGES.PRELUDE && (
          <PreludeInput
            category={category}
            mode={mode}
            language={language}
            onContinue={(desc) => { setUserDescription(desc); setStage(STAGES.QUESTIONS); }}
            onBack={() => setStage(STAGES.MODE)}
          />
        )}
        {stage === STAGES.QUESTIONS && (
          <QuestionFlow
            category={category}
            mode={mode}
            region={region}
            language={language}
            languageName={languageName}
            userDescription={userDescription}
            onComplete={handleQuestionsComplete}
            onBack={() => setStage(STAGES.PRELUDE)}
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
            language={language}
            languageName={languageName}
            streaming={streaming}
            searchStatus={searchStatus}
          />
        )}
      </main>
    </div>
  );
}
