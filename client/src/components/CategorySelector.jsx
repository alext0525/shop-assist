import { useState, useRef } from 'react';

// ─── Master category list ────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  { id: 'air-fryer',      label: 'Air Fryer',      emoji: '🍟', description: 'Basket, dual zone, oven style',         color: '#F97316' },
  { id: 'backpack',       label: 'Backpack',        emoji: '🎒', description: 'EDC, travel, hiking, school',           color: '#94A3B8' },
  { id: 'bike',           label: 'Bike',            emoji: '🚲', description: 'Road, mountain, e-bike, commuter',      color: '#10B981' },
  { id: 'camera-filter',  label: 'Cam Filter',      emoji: '🔮', description: 'ND, polarising, UV filters',            color: '#A78BFA' },
  { id: 'camera-flash',   label: 'Cam Flash',       emoji: '💡', description: 'Speedlites, strobes, TTL',              color: '#A78BFA' },
  { id: 'camera-storage', label: 'Cam Storage',     emoji: '💾', description: 'SD, CFexpress, XQD cards',             color: '#A78BFA' },
  { id: 'coffee-machine', label: 'Coffee Machine',  emoji: '☕', description: 'Espresso, drip, pod machines',         color: '#92400E' },
  { id: 'cpu',            label: 'CPU',             emoji: '🔲', description: 'Intel Core Ultra, AMD Ryzen',           color: '#6366F1' },
  { id: 'cpu-cooler',     label: 'CPU Cooler',      emoji: '❄️', description: 'Air towers, AIO liquid coolers',       color: '#06B6D4' },
  { id: 'field-monitor',  label: 'Field Monitor',   emoji: '📹', description: 'On-camera monitors',                   color: '#A78BFA' },
  { id: 'gaming-console', label: 'Console',         emoji: '🕹️', description: 'PS5, Xbox Series X, Switch',          color: '#EC4899' },
  { id: 'gpu',            label: 'Graphics Card',   emoji: '🎮', description: 'Gaming, creative, AI/ML',              color: '#6366F1' },
  { id: 'headphones',     label: 'Headphones',      emoji: '🎧', description: 'Over-ear, in-ear, TWS, gaming',        color: '#06B6D4' },
  { id: 'jewelry',        label: 'Jewellery',       emoji: '💍', description: 'Rings, necklaces, watches & more',     color: '#F472B6' },
  { id: 'keyboard',       label: 'Keyboard',        emoji: '⌨️', description: 'Mechanical, wireless, gaming',         color: '#6366F1' },
  { id: 'laptop',         label: 'Laptop',          emoji: '💻', description: 'Gaming, ultrabook, business',          color: '#6366F1' },
  { id: 'microphone',     label: 'Microphone',      emoji: '🎤', description: 'Shotgun, lavalier, USB, podcast',      color: '#06B6D4' },
  { id: 'monitor',        label: 'Monitor',         emoji: '🖥️', description: 'Gaming, pro, ultrawide',              color: '#6366F1' },
  { id: 'motherboard',    label: 'Motherboard',     emoji: '🔧', description: 'ATX, mATX, ITX, Intel & AMD',          color: '#6366F1' },
  { id: 'mouse',          label: 'Mouse',           emoji: '🖱️', description: 'Gaming, ergonomic, wireless',         color: '#6366F1' },
  { id: 'office-chair',   label: 'Office Chair',    emoji: '🪑', description: 'Ergonomic, gaming, mesh',              color: '#94A3B8' },
  { id: 'pc-case',        label: 'PC Case',         emoji: '🗃️', description: 'Mid tower, ITX, airflow, glass',      color: '#6366F1' },
  { id: 'psu',            label: 'Power Supply',    emoji: '🔌', description: 'Modular, 80 Plus Gold/Platinum',        color: '#6366F1' },
  { id: 'ram',            label: 'RAM',             emoji: '🧩', description: 'DDR5, DDR4, gaming kits',              color: '#6366F1' },
  { id: 'robot-vacuum',   label: 'Robot Vacuum',    emoji: '🤖', description: 'Roomba, Roborock, LiDAR mapping',      color: '#64748B' },
  { id: 'running-shoes',  label: 'Running Shoes',   emoji: '👟', description: 'Road, trail, everyday',                color: '#10B981' },
  { id: 'smartphone',     label: 'Smartphone',      emoji: '📱', description: 'Android, iPhone, flagship',            color: '#F59E0B' },
  { id: 'smartwatch',     label: 'Smartwatch',      emoji: '⌚', description: 'Fitness trackers, smart displays',     color: '#F59E0B' },
  { id: 'speakers',       label: 'Speakers',        emoji: '🔊', description: 'Bluetooth, bookshelf, soundbars',      color: '#06B6D4' },
  { id: 'ssd',            label: 'SSD',             emoji: '💿', description: 'NVMe PCIe 4/5, SATA, M.2',            color: '#6366F1' },
  { id: 'tablet',         label: 'Tablet',          emoji: '📋', description: 'iPad, Android, drawing tablets',       color: '#F59E0B' },
  { id: 'tripod',         label: 'Tripod',          emoji: '📷', description: 'Travel, studio, video',                color: '#A78BFA' },
  { id: 'tv',             label: 'TV',              emoji: '📺', description: '4K, OLED, QLED, smart TVs',           color: '#94A3B8' },
];

const CAT_BY_ID = Object.fromEntries(ALL_CATEGORIES.map(c => [c.id, c]));

// ─── Group definitions (order = display order) ───────────────────────────────
const GROUPS = [
  {
    id: 'popular', emoji: '🔥', label: 'Most Popular',
    ids: ['laptop', 'smartphone', 'gpu', 'headphones', 'gaming-console', 'tv', 'keyboard', 'monitor'],
  },
  {
    id: 'pc', emoji: '💻', label: 'PC & Computing',
    ids: ['gpu', 'cpu', 'motherboard', 'ram', 'ssd', 'psu', 'pc-case', 'cpu-cooler', 'keyboard', 'mouse', 'monitor', 'laptop'],
  },
  {
    id: 'audio', emoji: '🎵', label: 'Audio',
    ids: ['headphones', 'speakers', 'microphone'],
  },
  {
    id: 'mobile', emoji: '📱', label: 'Mobile & Wearables',
    ids: ['smartphone', 'tablet', 'smartwatch'],
  },
  {
    id: 'home', emoji: '🏠', label: 'Home & Kitchen',
    ids: ['tv', 'office-chair', 'air-fryer', 'robot-vacuum', 'coffee-machine'],
  },
  {
    id: 'camera', emoji: '📸', label: 'Photo & Video',
    ids: ['tripod', 'camera-flash', 'camera-storage', 'field-monitor', 'camera-filter', 'microphone'],
  },
  {
    id: 'sports', emoji: '🏃', label: 'Sports & Outdoor',
    ids: ['bike', 'running-shoes', 'backpack'],
  },
  {
    id: 'fashion', emoji: '✨', label: 'Fashion',
    ids: ['jewelry'],
  },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CategorySelector({ onSelect }) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const query = search.toLowerCase().trim();
  const hasQuery = query.length > 0;

  const filtered = hasQuery
    ? ALL_CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 flex flex-col">

      {/* ── Compact hero ─────────────────────────────────── */}
      <div
        className="text-center pt-10 pb-7 transition-all duration-500"
        style={{ opacity: hasQuery ? 0.2 : 1, transform: hasQuery ? 'translateY(-6px)' : 'none', pointerEvents: hasQuery ? 'none' : 'auto' }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}>
          AI-powered shopping
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{
          background: 'linear-gradient(135deg, #E2E8F0 0%, #A5B4FC 50%, #67E8F9 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2,
        }}>
          What are you<br className="sm:hidden" /> shopping for?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {ALL_CATEGORIES.length} categories · search or browse below
        </p>
      </div>

      {/* ── Search bar ───────────────────────────────────── */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ color: focused ? 'var(--accent)' : 'var(--text-faint)', transition: 'color .25s' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search or type anything…"
          style={{
            width: '100%', paddingLeft: 44, paddingRight: search ? 44 : 16,
            paddingTop: 16, paddingBottom: 16,
            background: 'var(--surface)',
            border: `2px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 18, color: 'var(--text)', fontSize: 15, outline: 'none',
            boxShadow: focused ? 'var(--glow)' : 'var(--shadow-md)',
            transition: 'border-color .25s, box-shadow .25s',
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

      {/* ── Content: search results or grouped browse ─────── */}
      {hasQuery ? (
        <SearchResults filtered={filtered} query={search.trim()} onSelect={onSelect} />
      ) : (
        <BrowseSections onSelect={onSelect} />
      )}
    </div>
  );
}

// ─── Browse — grouped horizontal scroll rows ─────────────────────────────────
function BrowseSections({ onSelect }) {
  return (
    <div className="flex flex-col gap-8 anim-fadeup">
      {GROUPS.map(group => {
        const cats = group.ids.map(id => CAT_BY_ID[id]).filter(Boolean);
        return (
          <section key={group.id}>
            <div className="flex items-center gap-2 mb-3 px-0.5">
              <span style={{ fontSize: 16 }}>{group.emoji}</span>
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                {group.label}
              </h2>
            </div>
            {/* Horizontal scroll row — hidden scrollbar, snap on mobile */}
            <div
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollPaddingLeft: 0 }}
            >
              {cats.map(cat => (
                <CategoryTile key={`${group.id}-${cat.id}`} cat={cat} onSelect={onSelect} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ─── Single category tile (horizontal scroll card) ───────────────────────────
function CategoryTile({ cat, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(cat.color);

  return (
    <button
      onClick={() => onSelect(cat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 flex flex-col items-center gap-2 rounded-2xl transition-all duration-200"
      style={{
        width: 82, paddingTop: 14, paddingBottom: 12, paddingLeft: 6, paddingRight: 6,
        scrollSnapAlign: 'start',
        background: hovered ? `rgba(${rgb},.1)` : 'var(--surface)',
        border: `1.5px solid ${hovered ? cat.color : 'var(--border)'}`,
        boxShadow: hovered ? `0 4px 20px rgba(${rgb},.3)` : 'var(--shadow)',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: `rgba(${rgb},.15)`,
          border: `1px solid rgba(${rgb},.25)`,
          boxShadow: hovered ? `0 0 14px rgba(${rgb},.5)` : 'none',
        }}
      >
        <span style={{ fontSize: 22 }}>{cat.emoji}</span>
      </div>
      <span
        className="text-xs font-semibold text-center leading-tight w-full"
        style={{ color: hovered ? cat.color : 'var(--text-muted)', transition: 'color .2s' }}
      >
        {cat.label}
      </span>
    </button>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────
function SearchResults({ filtered, query, onSelect }) {
  return (
    <div className="flex flex-col gap-5 anim-fadein">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <p className="text-4xl">🔍</p>
          <div>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
              No category matches for "{query}"
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              We can still find the best one for you
            </p>
          </div>
          <CustomSearchButton query={query} onSelect={onSelect} large />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((cat, idx) => (
              <SearchTile key={cat.id} cat={cat} idx={idx} onSelect={onSelect} />
            ))}
          </div>
          <div className="flex justify-center pt-1">
            <CustomSearchButton query={query} onSelect={onSelect} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Search result tile (bigger, with description) ───────────────────────────
function SearchTile({ cat, idx, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const rgb = hexToRgb(cat.color);

  return (
    <button
      onClick={() => onSelect(cat.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="anim-scaleup flex flex-col items-start gap-2.5 p-3.5 rounded-2xl text-left transition-all duration-200"
      style={{
        animationDelay: `${idx * 0.035}s`,
        background: hovered ? `rgba(${rgb},.1)` : 'var(--surface)',
        border: `1.5px solid ${hovered ? cat.color : 'var(--border)'}`,
        boxShadow: hovered ? `0 0 0 1px ${cat.color}22, 0 8px 24px rgba(${rgb},.2)` : 'var(--shadow)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'none',
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `rgba(${rgb},.15)`, border: `1px solid rgba(${rgb},.3)`, boxShadow: hovered ? `0 0 14px rgba(${rgb},.5)` : 'none', transition: 'box-shadow .2s' }}>
        <span style={{ fontSize: 20 }}>{cat.emoji}</span>
      </div>
      <div>
        <div className="text-xs font-bold mb-0.5" style={{ color: hovered ? cat.color : 'var(--text)', transition: 'color .2s' }}>
          {cat.label}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-faint)', lineHeight: 1.3 }}>{cat.description}</div>
      </div>
    </button>
  );
}

// ─── Custom search button ─────────────────────────────────────────────────────
function CustomSearchButton({ query, onSelect, large = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(query.trim())}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 rounded-2xl text-left transition-all duration-200"
      style={{
        padding: large ? '14px 22px' : '10px 18px',
        background: hovered ? 'rgba(99,102,241,.12)' : 'var(--surface)',
        border: `1.5px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--glow-sm)' : 'var(--shadow)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent-light)', border: '1px solid rgba(99,102,241,.25)', boxShadow: hovered ? 'var(--glow-sm)' : 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <div>
        <div className="font-bold" style={{ fontSize: large ? 14 : 12, color: 'var(--text)' }}>
          Search for "<span style={{ color: 'var(--accent)' }}>{query}</span>"
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
          AI will ask questions and find the best options
        </div>
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 4 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  );
}
