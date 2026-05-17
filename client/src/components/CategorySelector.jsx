import { useState, useRef, useEffect } from 'react';

const ALL_CATEGORIES = [
  { id: 'backpack',        label: 'Backpack',          emoji: '🎒', description: 'EDC, travel, hiking, school', group: 'Everyday' },
  { id: 'bike',            label: 'Bike',              emoji: '🚲', description: 'Road, mountain, e-bike, commuter', group: 'Sports' },
  { id: 'camera-filter',   label: 'Camera Filter',     emoji: '🔮', description: 'ND, polarising, UV, graduated', group: 'Camera' },
  { id: 'camera-flash',    label: 'Camera Flash',      emoji: '⚡', description: 'Speedlites, strobes, TTL flashes', group: 'Camera' },
  { id: 'camera-storage',  label: 'Camera Storage',    emoji: '💾', description: 'SD, CFexpress, XQD cards', group: 'Camera' },
  { id: 'field-monitor',   label: 'Field Monitor',     emoji: '📹', description: 'On-camera & director monitors', group: 'Camera' },
  { id: 'gpu',             label: 'Graphics Card',     emoji: '🎮', description: 'Gaming, creative, AI/ML', group: 'PC' },
  { id: 'headphones',      label: 'Headphones',        emoji: '🎧', description: 'Over-ear, in-ear, noise-cancelling', group: 'Audio' },
  { id: 'keyboard',        label: 'Keyboard',          emoji: '⌨️', description: 'Mechanical, wireless, gaming', group: 'PC' },
  { id: 'laptop',          label: 'Laptop',            emoji: '💻', description: 'Gaming, ultrabook, business', group: 'PC' },
  { id: 'microphone',      label: 'Microphone',        emoji: '🎤', description: 'Shotgun, lavalier, USB, podcast', group: 'Audio' },
  { id: 'monitor',         label: 'Monitor',           emoji: '🖥️', description: 'Gaming, pro displays, ultrawide', group: 'PC' },
  { id: 'mouse',           label: 'Mouse',             emoji: '🖱️', description: 'Gaming, ergonomic, wireless', group: 'PC' },
  { id: 'office-chair',    label: 'Office Chair',      emoji: '🪑', description: 'Ergonomic, gaming, mesh', group: 'Everyday' },
  { id: 'running-shoes',   label: 'Running Shoes',     emoji: '👟', description: 'Road, trail, everyday trainers', group: 'Sports' },
  { id: 'smartphone',      label: 'Smartphone',        emoji: '📱', description: 'Android, iPhone, budget, flagship', group: 'Mobile' },
  { id: 'smartwatch',      label: 'Smartwatch',        emoji: '⌚', description: 'Fitness trackers, smart displays', group: 'Mobile' },
  { id: 'speakers',        label: 'Speakers',          emoji: '🔊', description: 'Bluetooth, bookshelf, soundbars', group: 'Audio' },
  { id: 'tablet',          label: 'Tablet',            emoji: '📋', description: 'iPad, Android, drawing tablets', group: 'Mobile' },
  { id: 'tripod',          label: 'Tripod',            emoji: '📷', description: 'Travel, studio, video, monopods', group: 'Camera' },
  { id: 'tv',              label: 'TV',                emoji: '📺', description: '4K, OLED, QLED, smart TVs', group: 'Everyday' },
];

// Sorted alphabetically
const SORTED = [...ALL_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label));

const GROUP_COLORS = {
  Camera:   { bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.25)', text: '#7c3aed' },
  PC:       { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)', text: '#1d4ed8' },
  Audio:    { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.25)', text: '#0f766e' },
  Mobile:   { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', text: '#c2410c' },
  Sports:   { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  text: '#15803d' },
  Everyday: { bg: 'rgba(148,163,184,0.08)',border: 'rgba(148,163,184,0.25)',text: '#475569' },
};

export default function CategorySelector({ onSelect }) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? SORTED.filter(c =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.group.toLowerCase().includes(query)
      )
    : SORTED;

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-4 flex flex-col gap-8">

      {/* Hero heading + search */}
      <div className="text-center flex flex-col items-center gap-5">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            What would you like to shop for?
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            AI-powered recommendations with real prices from your region
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-lg relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-faint)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories… e.g. camera, audio, gaming"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              color: 'var(--text)',
              outline: 'none',
              boxShadow: 'var(--shadow-md)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-faint)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* Left: alphabetical sidebar */}
        <div className="hidden md:flex flex-col flex-shrink-0 w-48 rounded-2xl overflow-hidden sticky top-24" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>All categories</p>
          </div>
          <div className="flex flex-col overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {SORTED.map(cat => {
              const gc = GROUP_COLORS[cat.group] || {};
              const isMatch = !query || cat.label.toLowerCase().includes(query) || cat.description.toLowerCase().includes(query);
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-all"
                  style={{
                    opacity: query && !isMatch ? 0.3 : 1,
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span className="font-medium truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: filtered grid */}
        <div className="flex-1">
          {query && (
            <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>No categories found</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(cat => {
                const gc = GROUP_COLORS[cat.group] || {};
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  >
                    <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                    <div className="flex-1 w-full">
                      <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{cat.label}</div>
                      <div className="text-xs leading-snug" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: gc.bg, color: gc.text, border: `1px solid ${gc.border}` }}>
                      {cat.group}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
