import { useState, useRef, useEffect } from 'react';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
  tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage',
  'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter',
  'jewelry-rings': 'Rings', 'jewelry-necklace': 'Necklaces', 'jewelry-earrings': 'Earrings',
  'jewelry-bracelet': 'Bracelets', 'jewelry-watch': 'Fine Watches', 'jewelry-brooch': 'Brooches',
  'jewelry-anklet': 'Anklets', cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM',
  ssd: 'SSD / Storage', psu: 'Power Supply', 'pc-case': 'PC Case', 'cpu-cooler': 'CPU Cooler',
  'headphones-over-ear': 'Over-ear Headphones', 'headphones-tws': 'True Wireless Earbuds',
  'headphones-in-ear': 'In-ear / IEM', 'headphones-on-ear': 'On-ear Headphones',
  'headphones-gaming': 'Gaming Headset', 'air-fryer': 'Air Fryer',
};

// Category-aware placeholder hints
const HINTS = {
  laptop:          'e.g. mainly for video editing, needs a 4K screen, prefer something light under 1.5 kg',
  gpu:             'e.g. targeting 1440p 144fps, my case is quite small, I have a 650W PSU',
  cpu:             'e.g. mostly gaming, already have an AM5 motherboard, want the best single-core performance',
  'running-shoes': 'e.g. I overpronate, wide toe box, mostly road running 3× per week',
  smartphone:      'e.g. camera quality is everything, I'm on iOS, prefer a compact size',
  headphones:      'e.g. for commuting, need strong ANC, currently have an iPhone',
  'headphones-tws':'e.g. for commuting, need strong ANC, currently have an iPhone',
  'headphones-over-ear': 'e.g. home listening, open-back preferred, I have a DAC/amp',
  bike:            'e.g. road cycling for endurance, targeting events, budget around €2000',
  'office-chair':  'e.g. I sit 8+ hours a day, have lower back issues, prefer mesh for breathing',
  backpack:        'e.g. daily commute + laptop 15", waterproof preferred, minimalist look',
  tv:              'e.g. for a dark living room, primarily movies and gaming on PS5',
  'air-fryer':     'e.g. family of 4, want dual basket, must be dishwasher safe',
};

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export default function PreludeInput({ category, mode, onContinue, onBack }) {
  const [text, setText] = useState('');
  const textRef = useRef(null);
  const label = LABELS[category] || toTitleCase(category);
  const hint = HINTS[category] || `e.g. must-have features, deal-breakers, preferred style or material, specific use case…`;
  const hasText = text.trim().length > 0;

  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onContinue(text.trim());
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8 flex flex-col gap-6 px-2 anim-fadeup">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
          {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} · {label}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
          Anything we should know upfront?
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Describe key requirements, must-haves, or deal-breakers in your own words.
          The AI will build its questions around what you write here.
        </p>
      </div>

      {/* Text area card */}
      <div className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: 'var(--surface)', border: `1.5px solid ${hasText ? 'var(--accent)' : 'var(--border)'}`, boxShadow: hasText ? 'var(--glow-sm)' : 'var(--shadow-md)', transition: 'border-color .2s, box-shadow .2s' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>Your brief (optional)</span>
        </div>
        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hint}
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none"
          style={{
            background: 'var(--surface-2)',
            border: `1.5px solid ${hasText ? 'var(--accent)' : 'var(--border)'}`,
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color .15s',
            lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => { if (!text) e.target.style.borderColor = 'var(--border)'; }}
        />
        {hasText && (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Ctrl+Enter to continue
          </p>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-3 sticky bottom-0 pt-2 pb-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))', background: 'var(--bg)' }}>
        <button
          onClick={onBack}
          className="px-5 rounded-xl text-sm font-medium"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)', minHeight: 52 }}
        >
          Back
        </button>
        <button
          onClick={() => onContinue(text.trim())}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', minHeight: 52 }}
        >
          {hasText ? (
            <>Continue <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
          ) : (
            <>Skip <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>/ No description</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></>
          )}
        </button>
      </div>
    </div>
  );
}
