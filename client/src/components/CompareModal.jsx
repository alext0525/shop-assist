import { useEffect } from 'react';

export default function CompareModal({ products, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const allSpecs = [...new Set(products.flatMap(p => p.specs || []))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Comparison</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{products.length} products selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: `${200 + products.length * 200}px` }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-5 py-4 font-medium text-xs uppercase tracking-wider w-40" style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}>Feature</th>
                {products.map((p, i) => (
                  <th key={i} className="px-5 py-4 text-left" style={{ background: 'var(--surface)' }}>
                    <div className="flex flex-col gap-2">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
                      )}
                      <div className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>{p.name}</div>
                      {p.price && <span className="text-xs font-bold" style={{ color: '#16a34a' }}>{p.price}</span>}
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: 'var(--accent)' }} onClick={e => e.stopPropagation()}>
                        View product →
                      </a>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <td className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Match Score</td>
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
                        <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${p.score || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{p.score || '–'}%</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Why it fits</td>
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.reason}</td>
                ))}
              </tr>
              {allSpecs.map((spec, si) => (
                <tr key={si} style={{ borderBottom: '1px solid var(--border)', background: si % 2 === 0 ? 'var(--surface-2)' : 'var(--surface)' }}>
                  <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{spec}</td>
                  {products.map((p, pi) => (
                    <td key={pi} className="px-5 py-3 text-xs" style={{ color: 'var(--text)' }}>
                      {(p.specs || []).includes(spec) ? (
                        <span className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Yes
                        </span>
                      ) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
