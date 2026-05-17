const JEWELRY_SUBCATEGORIES = [
  { id: 'jewelry-rings',    label: 'Rings',       emoji: '💍', description: 'Engagement, wedding, fashion, signet' },
  { id: 'jewelry-necklace', label: 'Necklaces',   emoji: '📿', description: 'Chains, pendants, chokers' },
  { id: 'jewelry-earrings', label: 'Earrings',    emoji: '✨', description: 'Studs, hoops, drop & dangle' },
  { id: 'jewelry-bracelet', label: 'Bracelets',   emoji: '💛', description: 'Bangles, cuffs, tennis, charm' },
  { id: 'jewelry-watch',    label: 'Fine Watches', emoji: '🕰️', description: 'Luxury, automatic, dress watches' },
  { id: 'jewelry-brooch',   label: 'Brooches',    emoji: '🌸', description: 'Fashion & vintage decorative pins' },
  { id: 'jewelry-anklet',   label: 'Anklets',     emoji: '🌊', description: 'Gold, silver, beach jewelry' },
];

export default function SubcategorySelector({ onSelect, onBack }) {
  return (
    <div className="w-full max-w-xl mx-auto mt-14 flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="text-5xl mb-4">💍</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          What type of jewellery?
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          We'll ask about brands, quality, and community reputation to find the right piece.
        </p>
      </div>

      <div className="w-full grid grid-cols-2 gap-3">
        {JEWELRY_SUBCATEGORIES.map(sub => (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{sub.emoji}</span>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{sub.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub.description}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: 'var(--text-faint)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to all categories
      </button>
    </div>
  );
}
