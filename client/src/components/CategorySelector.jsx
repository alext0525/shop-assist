import { useState, useRef, useEffect } from 'react';

const ALL_CATEGORIES = [
  { id: 'backpack',        label: 'Backpack',        emoji: '🎒', description: 'EDC, travel, hiking, school',        group: 'Everyday',  color: '#94A3B8' },
  { id: 'bike',            label: 'Bike',            emoji: '🚲', description: 'Road, mountain, e-bike, commuter',   group: 'Sports',    color: '#10B981' },
  { id: 'camera-filter',   label: 'Cam Filter',      emoji: '🔮', description: 'ND, polarising, UV filters',         group: 'Camera',    color: '#A78BFA' },
  { id: 'camera-flash',    label: 'Cam Flash',       emoji: '⚡', description: 'Speedlites, strobes, TTL',           group: 'Camera',    color: '#A78BFA' },
  { id: 'camera-storage',  label: 'Cam Storage',     emoji: '💾', description: 'SD, CFexpress, XQD cards',          group: 'Camera',    color: '#A78BFA' },
  { id: 'field-monitor',   label: 'Field Monitor',   emoji: '📹', description: 'On-camera monitors',                group: 'Camera',    color: '#A78BFA' },
  { id: 'gpu',             label: 'Graphics Card',   emoji: '🎮', description: 'Gaming, creative, AI/ML',           group: 'PC',        color: '#6366F1' },
  { id: 'headphones',      label: 'Headphones',      emoji: '🎧', description: 'Over-ear, in-ear, wireless',        group: 'Audio',     color: '#06B6D4' },
  { id: 'jewelry',         label: 'Jewellery',       emoji: '💍', description: 'Rings, necklaces, watches & more',  group: 'Fashion',   color: '#F472B6' },
  { id: 'keyboard',        label: 'Keyboard',        emoji: '⌨️', description: 'Mechanical, wireless, gaming',      group: 'PC',        color: '#6366F1' },
  { id: 'laptop',          label: 'Laptop',          emoji: '💻', description: 'Gaming, ultrabook, business',       group: 'PC',        color: '#6366F1' },
  { id: 'microphone',      label: 'Microphone',      emoji: '🎤', description: 'Shotgun, lavalier, USB, podcast',   group: 'Audio',     color: '#06B6D4' },
  { id: 'monitor',         label: 'Monitor',         emoji: '🖥️', description: 'Gaming, pro, ultrawide',           group: 'PC',        color: '#6366F1' },
  { id: 'mouse',           label: 'Mouse',           emoji: '🖱️', description: 'Gaming, ergonomic, wireless',      group: 'PC',        color: '#6366F1' },
  { id: 'office-chair',    label: 'Office Chair',    emoji: '🪑', description: 'Ergonomic, gaming, mesh',           group: 'Everyday',  color: '#94A3B8' },
  { id: 'running-shoes',   label: 'Running Shoes',   emoji: '👟', description: 'Road, trail, everyday',             group: 'Sports',    color: '#10B981' },
  { id: 'smartphone',      label: 'Smartphone',      emoji: '📱', description: 'Android, iPhone, flagship',         group: 'Mobile',    color: '#F59E0B' },
  { id: 'smartwatch',      label: 'Smartwatch',      emoji: '⌚', description: 'Fitness trackers, smart displays',  group: 'Mobile',    color: '#F59E0B' },
  { id: 'speakers',        label: 'Speakers',        emoji: '🔊', description: 'Bluetooth, bookshelf, soundbars',   group: 'Audio',     color: '#06B6D4' },
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
    const t = setTimeout(() => inputRef.current?.focus(), 300);
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

  const showResults = query.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col" style={{ minHeight: 'calc(100dvh - 60px)' }}>

      <div className="flex gap-6 flex-1">

        {/* Left sidebar — always visible */}
        <div className="hidden lg:flex flex-col w-48 flex-shrink-0 pt-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-faint)' }}>All categories</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {SORTED.map(cat => (
              <button key={cat.id} onClick={() => onSelect(cat.id)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-all"
                style={{ color: 'var(--text-muted)', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(${hexToRgb(cat.color)},.1)`; e.currentTarget.style.color = cat.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                <span className="font-medium truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center — hero + search + results */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0" style={{ paddingTop: showResults ? 32 : 0 }}>

          {/* Hero — only when not searching */}
          <div
            className="text-center transition-all duration-700"
            style={{
              opacity: showResults ? 0.4 : 1,
              transform: showResults ? 'translateY(-20px) scale(.97)' : 'translateY(0) scale(1)',
              marginBottom: showResults ? 0 : 40,
              filter: showResults ? 'blur(1px)' : 'none',
            }}
          >
            {!showResults && (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
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
                <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                  Search or browse 22 categories
                </p>
              </>
            )}
          </div>

          {/* Search bar */}
          <div className="w-full max-w-lg" style={{ transition: 'all .6s cubic-bezier(.16,1,.3,1)' }}>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300"
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: focused ? 'var(--accent)' : 'var(--text-faint)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search categories…  e.g. lap, audio, camera"
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
                  fontSize: 16,
                  outline: 'none',
                  boxShadow: focused ? 'var(--glow)' : 'var(--shadow-md)',
                  transition: 'border-color .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1)',
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-faint)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {/* Mobile category list — below search on small screens */}
            <div className="lg:hidden mt-3 flex flex-wrap gap-2">
              {SORTED.slice(0, showResults ? 0 : 8).map(cat => (
                <button key={cat.id} onClick={() => onSelect(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              ))}
              {!showResults && SORTED.length > 8 && (
                <span className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>+{SORTED.length - 8} more…</span>
              )}
            </div>
          </div>

          {/* Search results */}
          {showResults && (
            <div className="w-full max-w-2xl mt-6">
              {filtered.length === 0 ? (
                <div className="text-center py-12 anim-fadein">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No matches for "{search}"</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different term or browse the sidebar</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filtered.map((cat, idx) => (
                    <ResultCard key={cat.id} cat={cat} idx={idx} onSelect={onSelect} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
        animationDelay: `${idx * 0.05}s`,
        background: hovered ? `rgba(${rgb},.1)` : 'var(--surface)',
        border: `1.5px solid ${hovered ? cat.color : 'var(--border)'}`,
        boxShadow: hovered ? `0 0 0 1px ${cat.color}22, 0 8px 32px rgba(${rgb},.2)` : 'var(--shadow)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'none',
        transition: 'all .35s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl"
        style={{ background: `rgba(${rgb},.15)`, border: `1px solid rgba(${rgb},.3)`, boxShadow: hovered ? `0 0 16px rgba(${rgb},.5)` : 'none', transition: 'box-shadow .35s ease' }}>
        <span style={{ fontSize: 22 }}>{cat.emoji}</span>
      </div>
      <div>
        <div className="text-sm font-bold mb-0.5" style={{ color: hovered ? cat.color : 'var(--text)', transition: 'color .2s' }}>{cat.label}</div>
        <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
      </div>
    </button>
  );
}
