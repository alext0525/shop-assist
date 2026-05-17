import { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../fetchJSON';

const LABELS = { keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones', monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone', 'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes' };

export default function QuestionFlow({ category, mode, onComplete, onBack, error }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [allQA, setAllQA] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetchQuestions([], 0); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [questions]);

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
      else { setQuestions(data.questions); setAnswers({}); }
    } catch (err) {
      setFetchError(err.message || 'Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every(q => (answers[q] || '').trim().length > 0);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    const batchQA = questions.map(q => ({ question: q, answer: answers[q].trim() }));
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
          {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
        </div>
        {mode === 'specific' && (
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

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
          <button onClick={() => fetchQuestions(allQA, batchIndex)} className="self-start px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#dc2626' }}>Retry</button>
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
          {questions.map((question, i) => (
            <div key={`${batchIndex}-${i}`} className="p-5 rounded-2xl transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>Q{allQA.length + i + 1}.</span>
                {question}
              </label>
              <textarea
                value={answers[question] || ''}
                onChange={e => setAnswers(p => ({ ...p, [question]: e.target.value }))}
                placeholder="Type your answer here..."
                rows={2}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
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
