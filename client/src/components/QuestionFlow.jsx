import { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../fetchJSON';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
};

export default function QuestionFlow({ category, mode, region, onComplete, onBack, error }) {
  const [currentQ, setCurrentQ] = useState(null); // { question, options }
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [otherText, setOtherText] = useState('');
  const [allQA, setAllQA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const maxQ = mode === 'vague' ? 3 : 12;
  const qNum = allQA.length + 1;

  useEffect(() => { loadNextQuestion([]); }, []);

  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading, currentQ]);

  async function loadNextQuestion(qa) {
    setLoading(true);
    setFetchError(null);
    setCurrentAnswer('');
    setOtherText('');
    try {
      const data = await fetchJSON('/api/chat/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, mode,
          previousQA: qa,
          currencyCode: region?.currency || 'USD',
          currencySymbol: getCurrencySymbol(region?.currency),
          currencyRate: 1, // rates applied client-side; server uses for display only
        }),
      });
      if (data.done) { onComplete(qa); }
      else { setCurrentQ(data); }
    } catch (err) {
      setFetchError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  function getCurrencySymbol(code) {
    const map = { USD: '$', EUR: '€', GBP: '£', PLN: 'zł', CHF: 'CHF ', SEK: 'kr', NOK: 'kr', DKK: 'kr', AUD: 'A$', CAD: 'C$', JPY: '¥', SGD: 'S$' };
    return map[code] || code + ' ';
  }

  const isOther = (opt) => opt?.toLowerCase().includes('other') || opt?.toLowerCase().includes('specify');
  const selectedIsOther = currentAnswer && isOther(currentAnswer);

  function getFinalAnswer() {
    if (!currentAnswer) return 'No preference';
    if (selectedIsOther) return otherText.trim() || 'No preference';
    return currentAnswer;
  }

  async function handleNext() {
    if (submitting || loading) return;
    setSubmitting(true);
    const answer = getFinalAnswer();
    const newQA = [...allQA, { question: currentQ.question, answer }];
    setAllQA(newQA);
    await loadNextQuestion(newQA);
    setSubmitting(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !currentQ?.options) { e.preventDefault(); handleNext(); }
  }

  const progressPct = Math.round(((qNum - 1) / maxQ) * 100);
  const isAnswered = getFinalAnswer() !== 'No preference';

  return (
    <div className="w-full max-w-lg mx-auto mt-10 flex flex-col gap-6">
      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
            {qNum - 1} / {maxQ}
          </span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-600 to-pink-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Previous answers */}
      {allQA.length > 0 && (
        <div className="flex flex-col gap-2">
          {allQA.map((qa, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>Q{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>{qa.question}</p>
                <p className="text-sm font-medium truncate" style={{ color: qa.answer === 'No preference' ? 'var(--text-faint)' : 'var(--text)' }}>
                  {qa.answer === 'No preference' ? '— no preference' : qa.answer}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)' }}>
          {fetchError}
          <button onClick={() => loadNextQuestion(allQA)} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}
      {error && <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)' }}>{error}</div>}

      {/* Current question */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-8 w-3/4 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)' }} />
          <div className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
        </div>
      ) : currentQ && (
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <p className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
            <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>Q{qNum}.</span>
            {currentQ.question}
          </p>

          {currentQ.options ? (
            <div className="flex flex-col gap-2">
              {currentQ.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = currentAnswer === opt;
                const isOtherOpt = isOther(opt);
                const isPref = opt.toLowerCase() === 'no preference';
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentAnswer(isSelected ? '' : opt); setOtherText(''); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-100"
                    style={isSelected
                      ? { background: 'var(--accent-light)', border: '2px solid var(--accent)', color: 'var(--text)' }
                      : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: isPref ? 'var(--text-faint)' : 'var(--text-muted)' }
                    }
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={isSelected
                        ? { background: 'var(--accent)', color: 'white' }
                        : { background: 'var(--border)', color: 'var(--text-muted)' }
                      }
                    >
                      {isSelected
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : letter}
                    </span>
                    <span className={isPref ? 'italic' : ''}>{opt}</span>
                  </button>
                );
              })}
              {selectedIsOther && (
                <textarea
                  ref={inputRef}
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  placeholder="Please specify..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none"
                  style={{ background: 'var(--surface-2)', border: '2px solid var(--accent)', color: 'var(--text)', outline: 'none' }}
                />
              )}
            </div>
          ) : (
            <textarea
              ref={inputRef}
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer, or click Continue to skip..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none"
              style={{
                background: 'var(--surface-2)',
                border: `2px solid ${currentAnswer ? 'var(--accent)' : 'var(--border)'}`,
                color: 'var(--text)',
                outline: 'none',
                display: 'block',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = currentAnswer ? 'var(--accent)' : 'var(--border)'}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      {!loading && (
        <div className="flex gap-3">
          {allQA.length === 0 && (
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Loading...</>
            ) : isAnswered ? (
              <>{qNum >= maxQ ? 'Find my products' : 'Next'} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            ) : (
              <>Skip / No preference <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
