import { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../fetchJSON';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Normalise a question item to { question, options }
function normalise(q) {
  if (typeof q === 'string') return { question: q, options: null };
  return { question: q.question, options: q.options || null };
}

function getKey(q) {
  return normalise(q).question;
}

function isOtherOption(opt) {
  return opt.toLowerCase().startsWith('e –') || opt.toLowerCase().includes('other');
}

export default function QuestionFlow({ category, mode, onComplete, onBack, error }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // key → answer string
  const [otherText, setOtherText] = useState({}); // key → custom "other" text
  const [allQA, setAllQA] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetchQuestions([], 0); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [questions, loading]);

  async function fetchQuestions(previousQA, batch) {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchJSON('/api/chat/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, mode, previousQA, batchIndex: batch }),
      });
      if (data.done) { onComplete(previousQA); }
      else { setQuestions(data.questions); setAnswers({}); setOtherText({}); }
    } catch (err) {
      setFetchError(err.message || 'Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  function getFinalAnswer(key) {
    const ans = answers[key] || '';
    if (isOtherOption(ans)) return otherText[key]?.trim() || '';
    return ans.trim();
  }

  const allAnswered = questions.length > 0 && questions.every(q => getFinalAnswer(getKey(q)).length > 0);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);

    const batchQA = questions.map(q => ({
      question: normalise(q).question,
      answer: getFinalAnswer(getKey(q)),
    }));
    const newAllQA = [...allQA, ...batchQA];
    setAllQA(newAllQA);
    const next = batchIndex + 1;
    setBatchIndex(next);

    if (mode === 'vague') { onComplete(newAllQA); return; }
    await fetchQuestions(newAllQA, next);
    setSubmitting(false);
  }

  const totalBatches = 3;
  const progressPct = Math.min((batchIndex / totalBatches) * 100, 100);

  return (
    <div className="w-full max-w-xl mx-auto mt-10 flex flex-col gap-5">
      <div className="text-center mb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
          {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
        </div>
        {mode === 'specific' && (
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {/* Previous answers (dimmed) */}
      {allQA.length > 0 && (
        <div className="flex flex-col gap-2 opacity-50">
          {allQA.map((qa, i) => (
            <div key={i} className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-faint)' }}>{qa.question}</p>
              <p style={{ color: 'var(--text-muted)' }}>{qa.answer}</p>
            </div>
          ))}
        </div>
      )}

      {fetchError && (
        <div className="p-4 rounded-xl text-sm flex flex-col gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          <p><strong>Error:</strong> {fetchError}</p>
          <button onClick={() => fetchQuestions(allQA, batchIndex)} className="self-start px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.15)' }}>Retry</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3 mt-2">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => {
            const { question, options } = normalise(q);
            const key = question;
            const selectedOpt = answers[key] || '';
            const showOtherInput = selectedOpt && isOtherOption(selectedOpt);

            return (
              <div key={`${batchIndex}-${i}`} className="p-5 rounded-2xl transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--text)' }}>
                  <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>Q{allQA.length + i + 1}.</span>
                  {question}
                </p>

                {options ? (
                  <div className="flex flex-col gap-2">
                    {options.map((opt, oi) => {
                      const letter = LETTERS[oi] || String.fromCharCode(65 + oi);
                      const isSelected = selectedOpt === opt;
                      const isOther = isOtherOption(opt);
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers(p => ({ ...p, [key]: opt }))}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                          style={isSelected ? {
                            background: 'var(--accent-light)',
                            border: '2px solid var(--accent)',
                            color: 'var(--text)',
                          } : {
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={isSelected
                              ? { background: 'var(--accent)', color: 'white' }
                              : { background: 'var(--border)', color: 'var(--text-muted)' }
                            }
                          >
                            {isSelected && !isOther
                              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              : letter
                            }
                          </span>
                          <span>{opt.replace(/^[A-F]\s*[–—-]\s*/i, '')}</span>
                        </button>
                      );
                    })}

                    {showOtherInput && (
                      <textarea
                        autoFocus
                        value={otherText[key] || ''}
                        onChange={e => setOtherText(p => ({ ...p, [key]: e.target.value }))}
                        placeholder="Please specify..."
                        rows={2}
                        className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all mt-1"
                        style={{ background: 'var(--surface-2)', border: '2px solid var(--accent)', color: 'var(--text)' }}
                      />
                    )}
                  </div>
                ) : (
                  <textarea
                    value={answers[key] || ''}
                    onChange={e => setAnswers(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="Type your answer here..."
                    rows={2}
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div ref={bottomRef} className="flex gap-3 mt-1">
        {allQA.length === 0 && (
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting || loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
        >
          {submitting ? 'Loading...' : mode === 'vague' ? 'Find my products →' : batchIndex < 2 ? 'Next questions →' : 'Find my products →'}
        </button>
      </div>
    </div>
  );
}
