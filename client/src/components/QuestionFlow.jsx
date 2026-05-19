import { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../fetchJSON';
import { getTranslations } from '../i18n';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
  tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage',
  'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter',
  'jewelry-rings': 'Rings', 'jewelry-necklace': 'Necklaces', 'jewelry-earrings': 'Earrings',
  'jewelry-bracelet': 'Bracelets', 'jewelry-watch': 'Fine Watches', 'jewelry-brooch': 'Brooches', 'jewelry-anklet': 'Anklets',
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', ssd: 'SSD / Storage',
  psu: 'Power Supply', 'pc-case': 'PC Case', 'cpu-cooler': 'CPU Cooler',
  'headphones-over-ear': 'Over-ear Headphones', 'headphones-tws': 'True Wireless Earbuds',
  'headphones-in-ear': 'In-ear / IEM', 'headphones-on-ear': 'On-ear Headphones',
  'headphones-gaming': 'Gaming Headset', 'air-fryer': 'Air Fryer',
  'gaming-console': 'Gaming Console', 'robot-vacuum': 'Robot Vacuum', 'coffee-machine': 'Coffee Machine',
  'e-reader': 'E-Reader', 'action-camera': 'Action Camera', 'projector': 'Projector',
  'dash-cam': 'Dash Cam', 'electric-toothbrush': 'Electric Toothbrush', 'electric-razor': 'Electric Razor',
  'hair-dryer': 'Hair Dryer', 'vacuum-cleaner': 'Vacuum Cleaner', 'security-camera': 'Security Camera',
  'portable-charger': 'Power Bank', 'standing-desk': 'Standing Desk', 'electric-scooter': 'Electric Scooter',
  'blender': 'Blender', 'printer': 'Printer', 'smart-speaker': 'Smart Speaker',
};

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function getCurrencySymbol(code) {
  const map = { USD: '$', EUR: '€', GBP: '£', PLN: 'zł', CHF: 'CHF ', SEK: 'kr', NOK: 'kr', DKK: 'kr', AUD: 'A$', CAD: 'C$', JPY: '¥', SGD: 'S$' };
  return map[code] || (code + ' ');
}

export default function QuestionFlow({ category, mode, region, language, languageName, userDescription, onComplete, onBack, error }) {
  const t = getTranslations(language);
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
    setCurrentQ(null);
    setSelected([]);
    setTextAnswer('');
    try {
      const data = await fetchJSON('/api/chat/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, mode,
          previousQA: qa,
          userDescription: userDescription || '',
          language: language || 'en',
          languageName: languageName || 'English',
          currencyCode: region?.currency || 'USD',
          currencySymbol: getCurrencySymbol(region?.currency),
          currencyRate: 1,
        }),
      });
      if (data.done) { onComplete(qa); }
      else { setCurrentQ(data); }
    } catch (err) {
      setFetchError(err.message || t.couldNotReach);
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
    <div className="w-full max-w-lg mx-auto mt-8 flex flex-col gap-5 px-2 anim-fadeup">

      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              {mode === 'vague'
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              {mode === 'vague' ? 'Quick Match' : 'Deep Dive'} · {LABELS[category] || toTitleCase(category)}
            </span>
          </div>
          <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)', border: '1px solid var(--border)' }}>
            {Math.max(qNum - 1, 0)} / {maxQ}
          </span>
        </div>
        {/* Glow progress bar */}
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: 'var(--gradient)', boxShadow: progressPct > 0 ? '0 0 10px rgba(99,102,241,.6)' : 'none' }} />
        </div>
      </div>

      {/* Previous answers */}
      {allQA.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {allQA.map((qa, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.65 }}>
              <span className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{i + 1}</span>
              <div className="flex-1 min-w-0 flex items-baseline gap-2">
                <p className="text-xs truncate flex-shrink-0 max-w-[40%]" style={{ color: 'var(--text-faint)' }}>{qa.question.split('?')[0]}?</p>
                <p className="text-xs font-semibold truncate" style={{ color: qa.answer === 'No preference' ? 'var(--text-faint)' : 'var(--accent-text)', fontStyle: qa.answer === 'No preference' ? 'italic' : 'normal' }}>
                  {qa.answer}
                </p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {(fetchError || error) && (
        <div className="p-4 rounded-xl text-sm flex items-start justify-between gap-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: 'var(--red)' }}>
          <span>{fetchError || error}</span>
          {fetchError && <button onClick={() => loadNext(allQA)} className="underline text-xs flex-shrink-0">{t.retry}</button>}
        </div>
      )}

      {/* Question card */}
      {loading ? (
        <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="h-4 w-2/3 rounded-lg skeleton" />
          <div className="flex flex-col gap-2 mt-2">
            {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
          </div>
        </div>
      ) : currentQ && (
        <div className="anim-slidein rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface)', border: `1.5px solid ${hasAnswer ? 'var(--accent)' : 'var(--border)'}`, boxShadow: hasAnswer ? 'var(--glow-sm)' : 'var(--shadow-md)', transition: 'border-color .2s, box-shadow .2s' }}>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 min-w-[28px] h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--gradient)', color: 'white', boxShadow: 'var(--glow-sm)' }}>
              {String(qNum).padStart(2, '0')}
            </span>
            <p className="text-base font-semibold leading-snug pt-0.5" style={{ color: 'var(--text)' }}>{currentQ.question}</p>
          </div>

          {currentQ.options ? (
            <>
              {/* Multi-select options */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selected.includes(opt);
                  const isNoPref = opt === 'No preference';
                  const displayOpt = isNoPref ? t.noPreference : opt;
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOption(opt)}
                      className="flex items-center gap-3 w-full px-4 rounded-xl text-sm text-left transition-all duration-100"
                      style={{
                        minHeight: 52,
                        ...(isSelected
                          ? { background: 'var(--accent-light)', border: '2px solid var(--accent)', color: 'var(--text)' }
                          : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: isNoPref ? 'var(--text-faint)' : 'var(--text-muted)' }
                        )
                      }}
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
                      <span className={isNoPref ? 'italic' : 'font-medium'}>{displayOpt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Always-visible custom text field */}
              <div>
                <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-faint)' }}>{t.addOwnDetails}</p>
                <textarea
                  ref={textRef}
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  placeholder={t.notListed}
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
                  {t.nSelected(selected.filter(o => o !== 'No preference').length)}
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
              placeholder={t.typeAnswer}
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

      {/* Navigation — sticky on mobile with safe area */}
      {!loading && (
        <div
          className="flex gap-3 sticky bottom-0 pt-3 pb-4"
          style={{
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
            background: 'var(--bg)',
          }}
        >
          {allQA.length === 0 && (
            <button
              onClick={onBack}
              className="px-5 rounded-xl text-sm font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)', minHeight: 52 }}
            >
              {t.back}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', minHeight: 52 }}
          >
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> {t.loading}</>
            ) : hasAnswer ? (
              <>{qNum >= maxQ ? t.findProducts : t.next} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            ) : (
              <>{t.skip} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>/ {t.noPreference}</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
