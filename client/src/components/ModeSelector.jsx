const LABELS = { keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones', monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone', 'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes', speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike', tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage', 'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter' };

export default function ModeSelector({ category, onSelect, onBack }) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-14 flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
          {LABELS[category] || category}
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>How specific do you want to get?</h1>
        <p style={{ color: 'var(--text-muted)' }}>More questions = more precise results.</p>
      </div>

      <div className="w-full grid sm:grid-cols-2 gap-4">
        {[
          { id: 'vague', icon: '⚡', title: 'Quick Match', desc: '3 simple questions, top 10 picks fast.', tags: ['3 questions', 'Top 10 results', '~2 min'], color: 'violet' },
          { id: 'specific', icon: '🎯', title: 'Deep Dive', desc: '10–12 adaptive questions for pinpoint accuracy.', tags: ['10–12 questions', 'Top 5–7 results', '~5 min'], color: 'pink' },
        ].map(({ id, icon, title, desc, tags, color }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex flex-col items-start gap-4 p-6 rounded-2xl text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color === 'violet' ? '#7c3aed' : '#db2777'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <div className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</div>
              <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{desc}</div>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color === 'violet' ? 'var(--accent-light)' : 'rgba(219,39,119,0.1)', color: color === 'violet' ? 'var(--accent-text)' : '#be185d' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="flex items-center gap-1 text-sm transition-colors" style={{ color: 'var(--text-faint)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>
    </div>
  );
}
