import { useState } from 'react';
import CompareModal from './CompareModal';
import ResultsChat from './ResultsChat';

const LABELS = { keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card', headphones: 'Headphones', monitor: 'Monitor', mouse: 'Mouse', laptop: 'Laptop', smartphone: 'Smartphone', 'office-chair': 'Office Chair', smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes' };

const RANK_STYLE = {
  1: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)', color: '#ca8a04', label: '🥇' },
  2: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.4)', color: '#64748b', label: '🥈' },
  3: { bg: 'rgba(234,88,12,0.12)', border: 'rgba(234,88,12,0.4)', color: '#ea580c', label: '🥉' },
};

export default function ProductResults({ products, setProducts, category, mode, allQA, onReset }) {
  const [selected, setSelected] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);

  function toggleSelect(i) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const selectedProducts = [...selected].map(i => products[i]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
            {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Your Top {products.length} Picks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Ranked by match quality · Click any card to view · Select multiple to compare
          </p>
        </div>
        <button onClick={onReset} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          New search
        </button>
      </div>

      {/* Products */}
      <div className="flex flex-col gap-3">
        {products.map((product, i) => (
          <ProductCard
            key={i}
            product={product}
            rank={i + 1}
            isSelected={selected.has(i)}
            onToggleSelect={() => toggleSelect(i)}
          />
        ))}
      </div>

      {/* Compare bar */}
      {selected.size >= 2 && (
        <div className="sticky bottom-4 flex items-center justify-between px-5 py-3.5 rounded-2xl z-30" style={{ background: 'var(--accent)', boxShadow: '0 8px 30px rgba(124,58,237,0.35)' }}>
          <div className="text-sm font-medium text-white">{selected.size} products selected</div>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors">
              Clear
            </button>
            <button onClick={() => setShowCompare(true)} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white transition-all hover:bg-white/90" style={{ color: 'var(--accent)' }}>
              Compare →
            </button>
          </div>
        </div>
      )}

      {/* AI Refinement Chat */}
      <ResultsChat
        category={category}
        mode={mode}
        allQA={allQA}
        currentProducts={products}
        onProductsUpdate={setProducts}
      />

      {showCompare && (
        <CompareModal products={selectedProducts} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}

function ProductCard({ product, rank, isSelected, onToggleSelect }) {
  const rs = RANK_STYLE[rank];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-150"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isSelected ? '0 0 0 3px var(--accent-light)' : 'var(--shadow)',
      }}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Image */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {product.imageUrl && !imgError ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <span className="text-3xl">{rank <= 3 ? RANK_STYLE[rank].label : '📦'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {rs ? (
                <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color }}>
                  #{rank}
                </span>
              ) : (
                <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-2)', color: 'var(--text-faint)', border: '1px solid var(--border)' }}>
                  #{rank}
                </span>
              )}
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold leading-snug hover:underline truncate" style={{ color: 'var(--text)' }}>
                {product.name}
              </a>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {product.price && (
                <span className="text-sm font-bold" style={{ color: '#16a34a' }}>{product.price}</span>
              )}
              {/* Compare checkbox */}
              <button
                onClick={onToggleSelect}
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                style={isSelected
                  ? { background: 'var(--accent)', border: '1px solid var(--accent)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border)' }
                }
              >
                {isSelected
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-faint)' }}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                }
              </button>
            </div>
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{product.reason}</p>

          {product.specs?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.specs.map((spec, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score bar */}
      {product.score && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--surface-2)' }}>
              <div className="h-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700" style={{ width: `${product.score}%` }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>{product.score}% match</span>
          </div>
        </div>
      )}
    </div>
  );
}
