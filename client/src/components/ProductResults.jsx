import { useState } from 'react';
import CompareModal from './CompareModal';
import ResultsChat from './ResultsChat';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card',
  headphones: 'Headphones', monitor: 'Monitor', mouse: 'Mouse',
  laptop: 'Laptop', smartphone: 'Smartphone', 'office-chair': 'Office Chair',
  smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
};

const RANK_BADGE = {
  1: { emoji: '🥇', bg: 'rgba(234,179,8,0.15)', color: '#b45309', border: 'rgba(234,179,8,0.5)' },
  2: { emoji: '🥈', bg: 'rgba(148,163,184,0.15)', color: '#475569', border: 'rgba(148,163,184,0.5)' },
  3: { emoji: '🥉', bg: 'rgba(234,88,12,0.15)', color: '#c2410c', border: 'rgba(234,88,12,0.5)' },
};

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

function CategoryPlaceholder({ category, rank }) {
  const emojis = { keyboard: '⌨️', backpack: '🎒', gpu: '🎮', headphones: '🎧', monitor: '🖥️', mouse: '🖱️', laptop: '💻', smartphone: '📱', speakers: '🔊', tablet: '📋', tv: '📺', bike: '🚲', 'office-chair': '🪑', smartwatch: '⌚', 'running-shoes': '👟' };
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)' }}>
      <span className="text-6xl opacity-40">{emojis[category] || '📦'}</span>
    </div>
  );
}

export default function ProductResults({ products, setProducts, category, mode, allQA, onReset, convertPrice = (p) => p }) {
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
    <div className="w-full max-w-6xl mx-auto mt-8 flex flex-col gap-6 px-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
            {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Your Top {products.length} Picks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Ranked by match · Tick cards to compare · Prices are approximate — click to see current price
          </p>
        </div>
        <button onClick={onReset} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          New search
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product, i) => (
          <ProductCard
            key={i}
            product={product}
            rank={i + 1}
            category={category}
            isSelected={selected.has(i)}
            onToggleSelect={() => toggleSelect(i)}
            convertPrice={convertPrice}
          />
        ))}
      </div>

      {/* Refinement chat */}
      <ResultsChat
        category={category}
        mode={mode}
        allQA={allQA}
        currentProducts={products}
        onProductsUpdate={(p) => { setProducts(p); setSelected(new Set()); }}
      />

      {/* Compare sticky bar */}
      {selected.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', minWidth: '320px' }}>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">{selected.size} products selected</div>
            <div className="text-white/70 text-xs">Ready to compare side-by-side</div>
          </div>
          <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-xs transition-colors px-2">
            Clear
          </button>
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white transition-all hover:bg-white/90 active:scale-95"
            style={{ color: '#7c3aed' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            Compare Now
          </button>
        </div>
      )}

      {showCompare && <CompareModal products={selectedProducts} onClose={() => setShowCompare(false)} />}
    </div>
  );
}

function ProductCard({ product, rank, category, isSelected, onToggleSelect, convertPrice }) {
  const [imgError, setImgError] = useState(false);
  const rb = RANK_BADGE[rank];
  const domain = getDomain(product.url);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: `2px solid ${isSelected ? '#7c3aed' : 'var(--border)'}`,
        boxShadow: isSelected ? '0 0 0 4px rgba(124,58,237,0.15), var(--shadow-md)' : 'var(--shadow-md)',
      }}
    >
      {/* Image area */}
      <div className="relative w-full" style={{ height: '220px', background: 'var(--surface-2)' }}>
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <CategoryPlaceholder category={category} rank={rank} />
        )}

        {/* Rank badge - top left */}
        {rb ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>
            {rb.emoji} #{rank}
          </div>
        ) : (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
            #{rank}
          </div>
        )}

        {/* Compare checkbox - top right */}
        <button
          onClick={onToggleSelect}
          title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm font-bold text-xs"
          style={isSelected
            ? { background: '#7c3aed', border: '2px solid white', color: 'white' }
            : { background: 'rgba(255,255,255,0.85)', border: '2px solid rgba(0,0,0,0.15)', color: '#374151' }
          }
        >
          {isSelected
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            : <span style={{ fontSize: '10px', fontWeight: 700 }}>CMP</span>
          }
        </button>

        {/* Price badge - bottom left */}
        {product.price && (
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm" style={{ background: 'rgba(22,163,74,0.9)', color: 'white' }}>
            {convertPrice(product.price)}
          </div>
        )}

        {/* Score - bottom right */}
        {product.score && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
            {product.score}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <div>
          <h3 className="text-sm font-bold leading-snug mb-0.5" style={{ color: 'var(--text)' }}>{product.name}</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{product.reason}</p>
        </div>

        {/* Community opinions */}
        {(product.pros?.length > 0 || product.cons?.length > 0 || product.communityNote) && (
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs">⭐</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>What people say</span>
            </div>
            {product.communityNote && (
              <p className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>"{product.communityNote}"</p>
            )}
            <div className="flex flex-col gap-1">
              {product.pros?.slice(0, 2).map((pro, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-xs mt-0.5" style={{ color: '#16a34a' }}>✓</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pro}</span>
                </div>
              ))}
              {product.cons?.slice(0, 1).map((con, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-xs mt-0.5" style={{ color: '#dc2626' }}>✗</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{con}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specs */}
        {product.specs?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.specs.map((spec, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* View product button */}
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
        >
          View Product
          {domain && <span className="text-white/60 text-xs font-normal">· {domain}</span>}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>
  );
}
