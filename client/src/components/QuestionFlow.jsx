import { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../fetchJSON';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
  tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage',
  'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter',
};

function getCurrencySymbol(code) {
  const map = { USD: '$', EUR: '€', GBP: '£', PLN: 'zł', CHF: 'CHF ', SEK: 'kr', NOK: 'kr', DKK: 'kr', AUD: 'A$', CAD: 'C$', JPY: '¥', SGD: 'S$' };
  return map[code] || (code + ' ');
}

export default function QuestionFlow({ category, mode, region, onComplete, onBack, error }) {
  const [currentQ, setCurrentQ] = useState(null);
  const [selected, setSelected] = useState([]);   // multi-select for option questions
  const [textAnswer, setTextAnswer] = useState(''); // free-text (for text-only) or "add more" for option questions
  const [allQA, setAllQA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef(null);

  const maxQ = mode === 'vague' ? 3 : 12;
  const qNum = allQA.length + 1;

  useEffect(() => { loadNext([]); }, []);

  async function loadNext(qa) {
    setLoading(true);
    setFetchError(null);
    setSelected([]);
    setTextAnswer('');
    try {
      const data = await fetchJSON('/api/chat/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, mode,
          previousQA: qa,
          currencyCode: region?.currency || 'USD',
          currencySymbol: getCurrencySymbol(region?.currency),
          currencyRate: 1,
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

  function toggleOption(opt) {
    if (opt === 'No preference') {
      setSelected(prev => prev.includes('No preference') ? [] : ['No preference']);
      setTextAnswer('');
      return;
    }
    setSelected(prev => {
      const without = prev.filter(o => o !== 'No preference');
      return without.includes(opt) ? without.filter(o => o !== opt) : [...without, opt];
    });
  }

  function getFinalAnswer() {
    const parts = [];
    if (currentQ?.options) {
      parts.push(...selected.filter(o => o !== 'No preference'));
    } else {
      if (textAnswer.trim()) parts.push(textAnswer.trim());
    }
    if (currentQ?.options && textAnswer.trim()) parts.push(textAnswer.trim());
    if (parts.length === 0) return 'No preference';
    return parts.join(', ');
  }

  const hasAnswer = getFinalAnswer() !== 'No preference';

  async function handleNext() {
    if (submitting || loading) return;
    setSubmitting(true);
    const answer = getFinalAnswer();
    const newQA = [...allQA, { question: currentQ.question, answer }];
    setAllQA(newQA);
    await loadNext(newQA);
    setSubmitting(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !currentQ?.options) {
      e.preventDefault();
      handleNext();
    }
  }

  const progressPct = Math.round(((qNum - 1) / maxQ) * 100);

  return (
    <div className="w-full max-w-lg mx-auto mt-10 flex flex-col gap-5 px-2">

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
          </span>
          <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-faint)' }}>
            {Math.max(qNum - 1, 0)} / {maxQ}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
        </div>
      </div>

      {/* Previous answers */}
      {allQA.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {allQA.map((qa, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-bold mt-0.5 flex-shrink-0 w-5 text-center" style={{ color: 'var(--accent)' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-0.5 truncate" style={{ color: 'var(--text-faint)' }}>{qa.question}</p>
                <p className="text-sm font-medium" style={{ color: qa.answer === 'No preference' ? 'var(--text-faint)' : 'var(--text)', fontStyle: qa.answer === 'No preference' ? 'italic' : 'normal' }}>
                  {qa.answer === 'No preference' ? 'No preference' : qa.answer}
                </p>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--green)', flexShrink: 0, marginTop: 3 }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {(fetchError || error) && (
        <div className="p-4 rounded-xl text-sm flex items-start justify-between gap-3" style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)' }}>
          <span>{fetchError || error}</span>
          {fetchError && <button onClick={() => loadNext(allQA)} className="underline text-xs flex-shrink-0">Retry</button>}
        </div>
      )}

      {/* Current question card */}
      {loading ? (
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="h-5 w-3/4 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)' }} />
          <div className="flex flex-col gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
          </div>
        </div>
      ) : currentQ && (
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface)', border: `1px solid ${hasAnswer ? 'var(--accent)' : 'var(--border)'}`, boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-sm font-bold mt-0.5" style={{ color: 'var(--accent)' }}>Q{qNum}.</span>
            <p className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>{currentQ.question}</p>
          </div>

          {currentQ.options ? (
            <>
              {/* Multi-select options */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selected.includes(opt);
                  const isNoPref = opt === 'No preference';
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOption(opt)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-100"
                      style={isSelected
                        ? { background: 'var(--accent-light)', border: '2px solid var(--accent)', color: 'var(--text)' }
                        : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: isNoPref ? 'var(--text-faint)' : 'var(--text-muted)' }
                      }
                    >
                      {/* Checkbox */}
                      <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all"
                        style={isSelected
                          ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                          : { borderColor: 'var(--border)', background: 'var(--surface)' }
                        }
                      >
                        {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </span>
                      <span className="flex-shrink-0 text-xs font-bold w-5 text-center" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-faint)' }}>{letter}</span>
                      <span className={isNoPref ? 'italic' : 'font-medium'}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Always-visible custom text field */}
              <div>
                <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-faint)' }}>Add your own details (optional):</p>
                <textarea
                  ref={textRef}
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  placeholder="e.g. I also need it to handle video editing, prefer aluminium build..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none"
                  style={{
                    background: 'var(--surface-2)',
                    border: `2px solid ${textAnswer ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => { if (!textAnswer) e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Selection summary */}
              {selected.filter(o => o !== 'No preference').length > 1 && (
                <p className="text-xs" style={{ color: 'var(--accent-text)' }}>
                  ✓ {selected.filter(o => o !== 'No preference').length} options selected
                </p>
              )}
            </>
          ) : (
            /* Free-text only */
            <textarea
              ref={textRef}
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer, or click Skip to continue..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none"
              style={{
                background: 'var(--surface-2)',
                border: `2px solid ${textAnswer ? 'var(--accent)' : 'var(--border)'}`,
                color: 'var(--text)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => { if (!textAnswer) e.target.style.borderColor = 'var(--border)'; }}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      {!loading && (
        <div className="flex gap-3">
          {allQA.length === 0 && (
            <button onClick={onBack} className="px-5 py-3 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Loading...</>
            ) : hasAnswer ? (
              <>{qNum >= maxQ ? 'Find my products' : 'Next'} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            ) : (
              <>Skip <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>/ No preference</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
