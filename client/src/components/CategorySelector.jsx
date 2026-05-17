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

const GROUP_ORDER = ['PC', 'Audio', 'Mobile', 'Camera', 'Sports', 'Fashion', 'Everyday'];

export default function CategorySelector({ onSelect }) {
  const [search, setSearch] = useState('');
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? SORTED.filter(c => c.label.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.group.toLowerCase().includes(query))
    : SORTED;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4 pb-8 anim-fadeup flex flex-col gap-10">

      {/* Hero */}
      <div className="text-center flex flex-col items-center gap-5 pt-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
            AI-powered shopping
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{
            background: 'linear-gradient(135deg, #E2E8F0 0%, #A5B4FC 50%, #67E8F9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            What are you hunting for?
          </h1>
          <p className="text-base max-w-md" style={{ color: 'var(--text-muted)' }}>
            Real-time web search · Region-aware prices · Community reviews
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-lg relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-faint)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full text-sm transition-all"
            style={{
              paddingLeft: 44, paddingRight: search ? 44 : 16, paddingTop: 14, paddingBottom: 14,
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 16,
              color: 'var(--text)',
              outline: 'none',
              boxShadow: 'var(--shadow-md)',
              fontSize: 15,
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = 'var(--glow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-md)'; }}
          />
          {search && (
            <button onClick={() => { setSearch(''); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all" style={{ background: 'var(--surface-3)', color: 'var(--text-faint)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 items-start">

        {/* Left sidebar */}
        <div className="hidden lg:flex flex-col w-44 flex-shrink-0 rounded-2xl overflow-hidden sticky top-24" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Browse all</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
            {SORTED.map(cat => {
              const isMatch = !query || cat.label.toLowerCase().includes(query);
              return (
                <button key={cat.id} onClick={() => onSelect(cat.id)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-all"
                  style={{ opacity: query && !isMatch ? 0.25 : 1, color: 'var(--text-muted)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                  <span className="font-medium truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {query && (
            <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span style={{ color: 'var(--accent-text)' }}>{search}</span>"
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 anim-fadein">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Nothing found</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((cat, idx) => (
                <CategoryCard key={cat.id} cat={cat} idx={idx} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ cat, idx, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const delay = `${Math.min(idx * 0.04, 0.4)}s`;

  return (
    <button
      onClick={() => onSelect(cat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="anim-fadeup flex flex-col items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200"
      style={{
        animationDelay: delay,
        background: hovered ? `rgba(${hexToRgb(cat.color)},0.08)` : 'var(--surface)',
        border: `1.5px solid ${hovered ? cat.color : 'var(--border)'}`,
        boxShadow: hovered ? `0 0 0 1px ${cat.color}22, 0 8px 32px ${cat.color}22, var(--shadow-md)` : 'var(--shadow)',
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
    >
      {/* Icon bubble */}
      <div className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200"
        style={{
          background: `rgba(${hexToRgb(cat.color)},0.15)`,
          border: `1px solid rgba(${hexToRgb(cat.color)},0.3)`,
          boxShadow: hovered ? `0 0 16px rgba(${hexToRgb(cat.color)},0.4)` : 'none',
        }}
      >
        <span style={{ fontSize: 22 }}>{cat.emoji}</span>
      </div>

      <div className="flex-1 w-full">
        <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--text)' }}>{cat.label}</div>
        <div className="text-xs leading-snug" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
      </div>

      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ background: `rgba(${hexToRgb(cat.color)},0.12)`, color: cat.color, border: `1px solid rgba(${hexToRgb(cat.color)},0.25)` }}>
        {cat.group}
      </span>
    </button>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
