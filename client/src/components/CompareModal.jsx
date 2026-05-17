import { useEffect } from 'react';

export default function CompareModal({ products, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-6xl rounded-2xl overflow-hidden mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
          <div>
            <h2 className="text-lg font-bold text-white">Side-by-side Comparison</h2>
            <p className="text-white/70 text-xs">{products.length} products · Press Esc to close</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: `${180 + products.length * 220}px` }}>
            {/* Product headers */}
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th className="px-5 py-4 text-left w-40 text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}>Feature</th>
                {products.map((p, i) => (
                  <th key={i} className="px-5 py-4 text-left align-top" style={{ background: 'var(--surface)' }}>
                    <div className="flex flex-col gap-2">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
                      )}
                      <div className="font-bold text-sm leading-snug" style={{ color: 'var(--text)' }}>{p.name}</div>
                      {p.price && <span className="text-sm font-bold" style={{ color: '#16a34a' }}>{p.price}</span>}
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#7c3aed' }} onClick={e => e.stopPropagation()}>
                        View product <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Match score */}
              <Row label="Match Score" alt>
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
              </Row>

              {/* Why it fits */}
              <Row label="Why it fits">
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.reason}</td>
                ))}
              </Row>

              {/* Community note */}
              <Row label="Community says" alt>
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3 text-xs italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {p.communityNote ? `"${p.communityNote}"` : '—'}
                  </td>
                ))}
              </Row>

              {/* Pros */}
              <Row label="Pros">
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      {(p.pros || []).map((pro, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span style={{ color: '#16a34a' }}>✓</span> {pro}
                        </div>
                      ))}
                      {!p.pros?.length && <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
                    </div>
                  </td>
                ))}
              </Row>

              {/* Cons */}
              <Row label="Cons" alt>
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      {(p.cons || []).map((con, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span style={{ color: '#dc2626' }}>✗</span> {con}
                        </div>
                      ))}
                      {!p.cons?.length && <span className="text-xs" style={{ color: 'var(--text-faint)' }}>—</span>}
                    </div>
                  </td>
                ))}
              </Row>

              {/* Specs */}
              <Row label="Key Specs">
                {products.map((p, i) => (
                  <td key={i} className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.specs || []).map((spec, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, alt }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', background: alt ? 'var(--surface-2)' : 'var(--surface)' }}>
      <td className="px-5 py-3 text-xs font-semibold uppercase tracking-wider align-top" style={{ color: 'var(--text-muted)' }}>{label}</td>
      {children}
    </tr>
  );
}
