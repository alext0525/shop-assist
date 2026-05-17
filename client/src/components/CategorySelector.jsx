const CATEGORIES = [
  { id: 'keyboard',      label: 'Keyboard',       emoji: '⌨️', description: 'Mechanical, wireless, gaming' },
  { id: 'backpack',      label: 'Backpack',        emoji: '🎒', description: 'EDC, travel, hiking, school' },
  { id: 'gpu',           label: 'Graphics Card',   emoji: '🎮', description: 'Gaming, creative, AI/ML' },
  { id: 'headphones',    label: 'Headphones',      emoji: '🎧', description: 'Over-ear, in-ear, noise-cancelling' },
  { id: 'monitor',       label: 'Monitor',         emoji: '🖥️', description: 'Gaming, pro displays, ultrawide' },
  { id: 'mouse',         label: 'Mouse',           emoji: '🖱️', description: 'Gaming, ergonomic, wireless' },
  { id: 'laptop',        label: 'Laptop',          emoji: '💻', description: 'Gaming, ultrabook, business' },
  { id: 'smartphone',    label: 'Smartphone',      emoji: '📱', description: 'Android, iPhone, budget, flagship' },
  { id: 'speakers',      label: 'Speakers',        emoji: '🔊', description: 'Bluetooth, bookshelf, soundbars' },
  { id: 'tablet',        label: 'Tablet',          emoji: '📋', description: 'iPad, Android, drawing tablets' },
  { id: 'tv',            label: 'TV',              emoji: '📺', description: '4K, OLED, QLED, smart TVs' },
  { id: 'bike',          label: 'Bike',            emoji: '🚲', description: 'Road, mountain, e-bike, commuter' },
  { id: 'office-chair',  label: 'Office Chair',    emoji: '🪑', description: 'Ergonomic, gaming, mesh' },
  { id: 'smartwatch',    label: 'Smartwatch',      emoji: '⌚', description: 'Fitness trackers, smart displays' },
  { id: 'running-shoes', label: 'Running Shoes',   emoji: '👟', description: 'Road, trail, everyday trainers' },
];

export default function CategorySelector({ onSelect }) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
          ✨ AI-powered shopping assistant
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>What are you shopping for?</h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Answer a few questions and I'll search the entire web to find your perfect match.
        </p>
      </div>

      <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-150 hover:scale-105 active:scale-95 group"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
          >
            <span className="text-3xl">{cat.emoji}</span>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{cat.label}</div>
              <div className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
