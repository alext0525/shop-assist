import { useState, useEffect } from 'react';
import { fetchJSON } from './fetchJSON';
import CategorySelector from './components/CategorySelector';
import ModeSelector from './components/ModeSelector';
import QuestionFlow from './components/QuestionFlow';
import ProductResults from './components/ProductResults';
import Header from './components/Header';

const STAGES = { CATEGORY: 'category', MODE: 'mode', QUESTIONS: 'questions', SEARCHING: 'searching', RESULTS: 'results' };

export default function App() {
  const [stage, setStage] = useState(STAGES.CATEGORY);
  const [category, setCategory] = useState(null);
  const [mode, setMode] = useState(null);
  const [products, setProducts] = useState([]);
  const [allQA, setAllQA] = useState([]);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  async function handleQuestionsComplete(qa) {
    setAllQA(qa);
    setStage(STAGES.SEARCHING);
    setError(null);
    try {
      const data = await fetchJSON('/api/search/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, mode, previousQA: qa }),
      });
      setProducts(data.products);
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
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header onReset={handleReset} showReset={stage !== STAGES.CATEGORY} isDark={isDark} setIsDark={setIsDark} />
      <main className="flex-1 flex flex-col items-center px-4 pb-20">
        {stage === STAGES.CATEGORY && <CategorySelector onSelect={(c) => { setCategory(c); setStage(STAGES.MODE); }} />}
        {stage === STAGES.MODE && <ModeSelector category={category} onSelect={(m) => { setMode(m); setStage(STAGES.QUESTIONS); }} onBack={() => setStage(STAGES.CATEGORY)} />}
        {stage === STAGES.QUESTIONS && <QuestionFlow category={category} mode={mode} onComplete={handleQuestionsComplete} onBack={() => setStage(STAGES.MODE)} error={error} />}
        {stage === STAGES.SEARCHING && <SearchingState category={category} />}
        {stage === STAGES.RESULTS && <ProductResults products={products} setProducts={setProducts} category={category} mode={mode} allQA={allQA} onReset={handleReset} />}
      </main>
    </div>
  );
}

function SearchingState({ category }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 mt-32">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold mb-1">Searching the web...</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Finding the best {category} options for you</p>
      </div>
    </div>
  );
}
