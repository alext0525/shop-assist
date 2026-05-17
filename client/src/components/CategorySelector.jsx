const CATEGORIES = [
  { id: 'keyboard',      label: 'Keyboard',       emoji: '⌨️', description: 'Mechanical, wireless, gaming' },
  { id: 'backpack',      label: 'Backpack',        emoji: '🎒', description: 'EDC, travel, hiking, school' },
  { id: 'gpu',           label: 'Graphics Card',   emoji: '🎮', description: 'Gaming, creative, AI/ML' },
  { id: 'headphones',    label: 'Headphones',      emoji: '🎧', description: 'Over-ear, in-ear, noise-cancelling' },
  { id: 'monitor',       label: 'Monitor',         emoji: '🖥️', description: 'Gaming, pro displays, ultrawide' },
  { id: 'mouse',         label: 'Mouse',           emoji: '🖱️', description: 'Gaming, ergonomic, wireless' },
  { id: 'laptop',        label: 'Laptop',          emoji: '💻', description: 'Gaming, ultrabook, business' },
  { id: 'smartphone',    label: 'Smartphone',      emoji: '📱', description: 'Android, iPhone, budget, flagship' },
  { id: 'office-chair',  label: 'Office Chair',    emoji: '🪑', description: 'Ergonomic, gaming, mesh' },
  { id: 'smartwatch',    label: 'Smartwatch',      emoji: '⌚', description: 'Fitness trackers, smart displays' },
  { id: 'running-shoes', label: 'Running Shoes',   emoji: '👟', description: 'Road, trail, everyday trainers' },
];

export default function CategorySelector({ onSelect }) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', border: '1px solid var(--accent-light)' }}>
          ✨ AI-powered product search
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>What are you shopping for?</h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Answer a few questions and I'll find your perfect match from across the web.
        </p>
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] group"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{cat.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{cat.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
