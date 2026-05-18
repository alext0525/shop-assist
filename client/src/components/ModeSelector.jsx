import { useState } from 'react';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones',
  monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone',
  'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike', jewelry: 'Jewellery',
  tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage',
  'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter',
  'jewelry-rings': 'Rings', 'jewelry-necklace': 'Necklaces', 'jewelry-earrings': 'Earrings',
  'jewelry-bracelet': 'Bracelets', 'jewelry-watch': 'Fine Watches', 'jewelry-brooch': 'Brooches', 'jewelry-anklet': 'Anklets',
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', ssd: 'SSD / Storage',
  psu: 'Power Supply', 'pc-case': 'PC Case', 'cpu-cooler': 'CPU Cooler',
  'headphones-over-ear': 'Over-ear Headphones', 'headphones-tws': 'True Wireless Earbuds',
  'headphones-in-ear': 'In-ear / IEM', 'headphones-on-ear': 'On-ear Headphones',
  'headphones-gaming': 'Gaming Headset', 'air-fryer': 'Air Fryer',
};

function LightningIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
}

function CrosshairIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
  );
}

const MODES = [
  {
    id: 'vague',
    title: 'Quick Match',
    subtitle: 'Fast recommendations',
    icon: LightningIcon,
    color: '#6366F1',
    rgb: '99,102,241',
    chips: ['3 questions', 'Top 10 results', '~2 min'],
    desc: 'Answer 3 broad questions. Great if you\'re not sure exactly what you want.',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,.15) 0%, rgba(139,92,246,.1) 100%)',
  },
  {
    id: 'specific',
    title: 'Deep Dive',
    subtitle: 'Precision targeting',
    icon: CrosshairIcon,
    color: '#06B6D4',
    rgb: '6,182,212',
    chips: ['12 questions', 'Top 7 results', '~5 min'],
    desc: 'Answer detailed spec questions. Perfect if you know what you need.',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,.12) 0%, rgba(99,102,241,.1) 100%)',
  },
];

export default function ModeSelector({ category, onSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const label = LABELS[category] || category;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 flex flex-col items-center gap-8 px-4 anim-fadeup">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
          {label}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
          Choose your mode
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          How much do you already know about what you want?
        </p>
      </div>

      <div className="w-full grid sm:grid-cols-2 gap-4">
        {MODES.map(m => {
          const isHovered = hovered === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-start gap-5 p-6 rounded-2xl text-left transition-all duration-200"
              style={{
                background: isHovered ? m.gradient : 'var(--surface)',
                border: `1.5px solid ${isHovered ? m.color : 'var(--border)'}`,
                boxShadow: isHovered ? `0 0 0 1px ${m.color}33, 0 12px 40px rgba(${m.rgb},.2)` : 'var(--shadow)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-xl transition-all"
                style={{
                  background: `rgba(${m.rgb},.15)`,
                  border: `1px solid rgba(${m.rgb},.3)`,
                  boxShadow: isHovered ? `0 0 20px rgba(${m.rgb},.5)` : 'none',
                  color: m.color,
                }}
              >
                <Icon />
              </div>

              <div>
                <div className="text-lg font-bold mb-0.5" style={{ color: isHovered ? m.color : 'var(--text)' }}>{m.title}</div>
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-faint)' }}>{m.subtitle}</div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.chips.map(chip => (
                    <span key={chip} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: `rgba(${m.rgb},.12)`, color: m.color, border: `1px solid rgba(${m.rgb},.25)` }}>
                      {chip}
                    </span>
                  ))}
                </div>
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
        Back
      </button>
    </div>
  );
}
