import { useState } from 'react';

const CONFIG = {
  jewelry: {
    emoji: '💍',
    glow: 'rgba(244,114,182,.4)',
    title: 'What type of jewellery?',
    subtitle: "We'll ask about brands, quality, and community reputation.",
    items: [
      { id: 'jewelry-rings',    label: 'Rings',        emoji: '💍', description: 'Engagement, wedding, fashion, signet', color: '#F472B6' },
      { id: 'jewelry-necklace', label: 'Necklaces',    emoji: '📿', description: 'Chains, pendants, chokers',            color: '#F472B6' },
      { id: 'jewelry-earrings', label: 'Earrings',     emoji: '✨', description: 'Studs, hoops, drop & dangle',          color: '#F472B6' },
      { id: 'jewelry-bracelet', label: 'Bracelets',    emoji: '💛', description: 'Bangles, cuffs, tennis, charm',        color: '#F59E0B' },
      { id: 'jewelry-watch',    label: 'Fine Watches', emoji: '🕰️', description: 'Luxury, automatic, dress watches',    color: '#94A3B8' },
      { id: 'jewelry-brooch',   label: 'Brooches',     emoji: '🌸', description: 'Fashion & vintage decorative pins',    color: '#F472B6' },
      { id: 'jewelry-anklet',   label: 'Anklets',      emoji: '🌊', description: 'Gold, silver, beach jewelry',          color: '#06B6D4' },
    ],
  },
  headphones: {
    emoji: '🎧',
    glow: 'rgba(99,102,241,.4)',
    title: 'What type of headphones?',
    subtitle: 'Pick the form factor that suits your use.',
    items: [
      { id: 'headphones-over-ear', label: 'Over-ear',       emoji: '🎧', description: 'Closed & open-back, ANC, studio',        color: '#6366F1' },
      { id: 'headphones-tws',      label: 'True Wireless',  emoji: '🎵', description: 'AirPods, Galaxy Buds, wireless earbuds',  color: '#8B5CF6' },
      { id: 'headphones-in-ear',   label: 'In-ear / IEM',   emoji: '🎶', description: 'Wired earphones, audiophile IEMs',        color: '#A78BFA' },
      { id: 'headphones-on-ear',   label: 'On-ear',         emoji: '🎼', description: 'Portable, foldable, supra-aural',         color: '#06B6D4' },
      { id: 'headphones-gaming',   label: 'Gaming Headset', emoji: '🕹️', description: 'PC, PS5, Xbox, surround sound',          color: '#10B981' },
    ],
  },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

export default function SubcategorySelector({ category, onSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const conf = CONFIG[category];

  if (!conf) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-12 flex flex-col items-center gap-8 px-4 anim-fadeup">
      <div className="text-center">
        <div className="text-5xl mb-4" style={{ filter: `drop-shadow(0 0 20px ${conf.glow})` }}>{conf.emoji}</div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
          {conf.title}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{conf.subtitle}</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-3">
        {conf.items.map((sub, idx) => {
          const isHov = hovered === sub.id;
          const rgb = hexToRgb(sub.color);
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              onMouseEnter={() => setHovered(sub.id)}
              onMouseLeave={() => setHovered(null)}
              className={`anim-fadeup flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 stagger-${idx + 1}`}
              style={{
                background: isHov ? `rgba(${rgb},.1)` : 'var(--surface)',
                border: `1.5px solid ${isHov ? sub.color : 'var(--border)'}`,
                boxShadow: isHov ? `0 0 0 1px ${sub.color}33, 0 8px 32px rgba(${rgb},.2)` : 'var(--shadow)',
                transform: isHov ? 'translateY(-3px)' : 'none',
              }}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                style={{ background: `rgba(${rgb},.15)`, border: `1px solid rgba(${rgb},.3)`, boxShadow: isHov ? `0 0 16px rgba(${rgb},.4)` : 'none' }}>
                <span style={{ fontSize: 22 }}>{sub.emoji}</span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: isHov ? sub.color : 'var(--text)' }}>{sub.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-all"
        style={{ color: 'var(--text-faint)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        Back to all categories
      </button>
    </div>
  );
}
