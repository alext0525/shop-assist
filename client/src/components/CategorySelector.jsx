import { useState, useRef, useEffect } from 'react';

const ALL_CATEGORIES = [
  // Everyday
  { id: 'air-fryer',       label: 'Air Fryer',       emoji: '🍟', description: 'Basket, dual zone, oven style',     group: 'Kitchen',   color: '#F97316' },
  { id: 'backpack',        label: 'Backpack',        emoji: '🎒', description: 'EDC, travel, hiking, school',        group: 'Everyday',  color: '#94A3B8' },
  { id: 'bike',            label: 'Bike',            emoji: '🚲', description: 'Road, mountain, e-bike, commuter',   group: 'Sports',    color: '#10B981' },
  // Camera
  { id: 'camera-filter',   label: 'Cam Filter',      emoji: '🔮', description: 'ND, polarising, UV filters',         group: 'Camera',    color: '#A78BFA' },
  { id: 'camera-flash',    label: 'Cam Flash',       emoji: '⚡', description: 'Speedlites, strobes, TTL',           group: 'Camera',    color: '#A78BFA' },
  { id: 'camera-storage',  label: 'Cam Storage',     emoji: '💾', description: 'SD, CFexpress, XQD cards',          group: 'Camera',    color: '#A78BFA' },
  { id: 'field-monitor',   label: 'Field Monitor',   emoji: '📹', description: 'On-camera monitors',                group: 'Camera',    color: '#A78BFA' },
  // PC
  { id: 'cpu',             label: 'CPU',             emoji: '🔲', description: 'Intel Core Ultra, AMD Ryzen',        group: 'PC',        color: '#6366F1' },
  { id: 'cpu-cooler',      label: 'CPU Cooler',      emoji: '❄️', description: 'Air towers, AIO liquid coolers',    group: 'PC',        color: '#6366F1' },
  { id: 'gpu',             label: 'Graphics Card',   emoji: '🎮', description: 'Gaming, creative, AI/ML',           group: 'PC',        color: '#6366F1' },
  { id: 'headphones',      label: 'Headphones',      emoji: '🎧', description: 'Over-ear, in-ear, TWS, gaming',     group: 'Audio',     color: '#06B6D4' },
  { id: 'jewelry',         label: 'Jewellery',       emoji: '💍', description: 'Rings, necklaces, watches & more',  group: 'Fashion',   color: '#F472B6' },
  { id: 'keyboard',        label: 'Keyboard',        emoji: '⌨️', description: 'Mechanical, wireless, gaming',      group: 'PC',        color: '#6366F1' },
  { id: 'laptop',          label: 'Laptop',          emoji: '💻', description: 'Gaming, ultrabook, business',       group: 'PC',        color: '#6366F1' },
  { id: 'microphone',      label: 'Microphone',      emoji: '🎤', description: 'Shotgun, lavalier, USB, podcast',   group: 'Audio',     color: '#06B6D4' },
  { id: 'monitor',         label: 'Monitor',         emoji: '🖥️', description: 'Gaming, pro, ultrawide',           group: 'PC',        color: '#6366F1' },
  { id: 'motherboard',     label: 'Motherboard',     emoji: '🔧', description: 'ATX, mATX, ITX, Intel & AMD',       group: 'PC',        color: '#6366F1' },
  { id: 'mouse',           label: 'Mouse',           emoji: '🖱️', description: 'Gaming, ergonomic, wireless',      group: 'PC',        color: '#6366F1' },
  { id: 'office-chair',    label: 'Office Chair',    emoji: '🪑', description: 'Ergonomic, gaming, mesh',           group: 'Everyday',  color: '#94A3B8' },
  { id: 'pc-case',         label: 'PC Case',         emoji: '🗃️', description: 'Mid tower, ITX, airflow, glass',   group: 'PC',        color: '#6366F1' },
  { id: 'psu',             label: 'Power Supply',    emoji: '⚡', description: 'Modular, 80 Plus Gold/Platinum',     group: 'PC',        color: '#6366F1' },
  { id: 'ram',             label: 'RAM',             emoji: '🧩', description: 'DDR5, DDR4, gaming kits',           group: 'PC',        color: '#6366F1' },
  { id: 'running-shoes',   label: 'Running Shoes',   emoji: '👟', description: 'Road, trail, everyday',             group: 'Sports',    color: '#10B981' },
  { id: 'smartphone',      label: 'Smartphone',      emoji: '📱', description: 'Android, iPhone, flagship',         group: 'Mobile',    color: '#F59E0B' },
  { id: 'smartwatch',      label: 'Smartwatch',      emoji: '⌚', description: 'Fitness trackers, smart displays',  group: 'Mobile',    color: '#F59E0B' },
  { id: 'speakers',        label: 'Speakers',        emoji: '🔊', description: 'Bluetooth, bookshelf, soundbars',   group: 'Audio',     color: '#06B6D4' },
  { id: 'ssd',             label: 'SSD / Storage',   emoji: '💿', description: 'NVMe PCIe 4/5, SATA, M.2',         group: 'PC',        color: '#6366F1' },
  { id: 'tablet',          label: 'Tablet',          emoji: '📋', description: 'iPad, Android, drawing tablets',    group: 'Mobile',    color: '#F59E0B' },
  { id: 'tripod',          label: 'Tripod',          emoji: '📷', description: 'Travel, studio, video',             group: 'Camera',    color: '#A78BFA' },
  { id: 'tv',              label: 'TV',              emoji: '📺', description: '4K, OLED, QLED, smart TVs',        group: 'Everyday',  color: '#94A3B8' },
];

const SORTED = [...ALL_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label));

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

export default function CategorySelector({ onSelect }) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? SORTED.filter(c =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.group.toLowerCase().includes(query)
      )
    : [];

  const hasQuery = query.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex gap-6" style={{ minHeight: 'calc(100dvh - 60px)' }}>

      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-48 flex-shrink-0 pt-10 self-start sticky top-24">
        <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-faint)' }}>
          All categories
        </p>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {SORTED.map(cat => (
            <button key={cat.id} onClick={() => onSelect(cat.id)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm"
              style={{ color: 'var(--text-muted)', background: 'transparent', transition: 'all .2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cat.color)},.1)`; e.currentTarget.style.color = cat.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span className="font-medium truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center column — fixed layout, no jumps */}
      <div className="flex-1 flex flex-col items-center pt-16 sm:pt-24">

        {/* Hero text — fades in place, never moves */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
          opacity: hasQuery ? 0.25 : 1,
          transition: 'opacity .5s var(--ease-flow)',
          pointerEvents: hasQuery ? 'none' : 'auto',
        }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
            AI-powered shopping
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4" style={{
            background: 'linear-gradient(135deg, #E2E8F0 0%, #A5B4FC 50%, #67E8F9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.15,
          }}>
            What are you<br />hunting for?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Search or browse {SORTED.length} categories
          </p>
        </div>

        {/* Search bar — stays exactly here, never moves */}
        <div className="w-full max-w-lg" style={{ position: 'relative', zIndex: 10 }}>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: focused ? 'var(--accent)' : 'var(--text-faint)', transition: 'color .3s' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search categories…  e.g. laptop, audio, camera"
              style={{
                width: '100%',
                paddingLeft: 48,
                paddingRight: search ? 48 : 20,
                paddingTop: 18,
                paddingBottom: 18,
                background: 'var(--surface)',
                border: `2px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 20,
                color: 'var(--text)',
                fontSize: 15,
                outline: 'none',
                boxShadow: focused ? 'var(--glow)' : 'var(--shadow-md)',
                transition: 'border-color .3s ease, box-shadow .3s ease',
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface-3)', color: 'var(--text-faint)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Mobile pill shortcuts — only when not searching */}
          {!hasQuery && (
            <div className="lg:hidden mt-4 flex flex-wrap gap-2" style={{ transition: 'opacity .3s', opacity: hasQuery ? 0 : 1 }}>
              {SORTED.slice(0, 8).map(cat => (
                <button key={cat.id} onClick={() => onSelect(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all .2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results — appear smoothly below, bar stays put */}
        <div className="w-full max-w-2xl mt-8" style={{ minHeight: 0 }}>
          {hasQuery && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-5 py-8 anim-fadein">
              <div className="text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No category matches for "{search}"</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We can still find the best one for you</p>
              </div>
              <CustomSearchButton query={query} onSelect={onSelect} large />
            </div>
          )}

          {hasQuery && filtered.length > 0 && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((cat, idx) => (
                  <ResultCard key={cat.id} cat={cat} idx={idx} onSelect={onSelect} />
                ))}
              </div>
              <div className="flex justify-center">
                <CustomSearchButton query={query} onSelect={onSelect} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomSearchButton({ query, onSelect, large = false }) {
  const [hovered, setHovered] = useState(false);
  const label = query.trim();
  return (
    <button
      onClick={() => onSelect(label)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 rounded-2xl text-left transition-all duration-200"
      style={{
        padding: large ? '16px 24px' : '12px 20px',
        background: hovered ? 'rgba(99,102,241,.12)' : 'var(--surface)',
        border: `1.5px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--glow-sm)' : 'var(--shadow)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
        style={{ background: 'var(--accent-light)', border: '1px solid rgba(99,102,241,.25)', boxShadow: hovered ? 'var(--glow-sm)' : 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      <div>
        <div className="font-bold" style={{ fontSize: large ? 15 : 13, color: 'var(--text)' }}>
          Search for "<span style={{ color: 'var(--accent)' }}>{label}</span>"
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          AI will ask you questions and find the best options
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 4 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  );
}

function ResultCard({ cat, idx, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(cat.color);

  return (
    <button
      onClick={() => onSelect(cat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="anim-scaleup flex flex-col items-start gap-3 p-4 rounded-2xl text-left"
      style={{
        animationDelay: `${idx * 0.04}s`,
        background: hovered ? `rgba(${rgb},.1)` : 'var(--surface)',
        border: `1.5px solid ${hovered ? cat.color : 'var(--border)'}`,
        boxShadow: hovered ? `0 0 0 1px ${cat.color}22, 0 8px 32px rgba(${rgb},.2)` : 'var(--shadow)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'none',
        transition: 'all .35s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl"
        style={{
          background: `rgba(${rgb},.15)`,
          border: `1px solid rgba(${rgb},.3)`,
          boxShadow: hovered ? `0 0 16px rgba(${rgb},.5)` : 'none',
          transition: 'box-shadow .35s ease',
        }}>
        <span style={{ fontSize: 22 }}>{cat.emoji}</span>
      </div>
      <div>
        <div className="text-sm font-bold mb-0.5"
          style={{ color: hovered ? cat.color : 'var(--text)', transition: 'color .2s' }}>
          {cat.label}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
      </div>
    </button>
  );
}
