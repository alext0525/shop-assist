import { useState } from 'react';
import CompareModal from './CompareModal';
import ResultsChat from './ResultsChat';

const LABELS = {
  keyboard: 'Keyboard', backpack: 'Backpack', gpu: 'Graphics Card',
  headphones: 'Headphones', monitor: 'Monitor', mouse: 'Mouse',
  laptop: 'Laptop', smartphone: 'Smartphone', 'office-chair': 'Office Chair',
  smartwatch: 'Smartwatch', 'running-shoes': 'Running Shoes',
  speakers: 'Speakers', tablet: 'Tablet', tv: 'TV', bike: 'Bike',
  tripod: 'Tripod', 'camera-flash': 'Camera Flash', 'camera-storage': 'Camera Storage',
  'field-monitor': 'Field Monitor', microphone: 'Microphone', 'camera-filter': 'Camera Filter',
  'jewelry-rings': 'Rings', 'jewelry-necklace': 'Necklaces', 'jewelry-earrings': 'Earrings',
  'jewelry-bracelet': 'Bracelets', 'jewelry-watch': 'Fine Watches', 'jewelry-brooch': 'Brooches',
  'jewelry-anklet': 'Anklets',
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', ssd: 'SSD / Storage',
  psu: 'Power Supply', 'pc-case': 'PC Case', 'cpu-cooler': 'CPU Cooler',
  'headphones-over-ear': 'Over-ear Headphones', 'headphones-tws': 'True Wireless Earbuds',
  'headphones-in-ear': 'In-ear / IEM', 'headphones-on-ear': 'On-ear Headphones',
  'headphones-gaming': 'Gaming Headset', 'air-fryer': 'Air Fryer',
};

const RANK_STYLE = {
  1: { label: '🥇', bg: 'rgba(234,179,8,0.12)', color: '#92400e', border: 'rgba(234,179,8,0.4)' },
  2: { label: '🥈', bg: 'rgba(148,163,184,0.12)', color: '#374151', border: 'rgba(148,163,184,0.4)' },
  3: { label: '🥉', bg: 'rgba(234,88,12,0.12)', color: '#7c2d12', border: 'rgba(234,88,12,0.4)' },
};

const REVIEW_DOMAINS = new Set([
  'rtings.com', 'notebookcheck.net', 'notebookcheck.com', 'tomsguide.com',
  'techradar.com', 'gsmarena.com', 'pcmag.com', 'theverge.com', '9to5mac.com',
  'engadget.com', 'cnet.com', 'wired.com', 'tomshardware.com', 'anandtech.com',
  'digitaltrends.com', 'trustedreviews.com', 'expertreviews.co.uk',
  'soundguys.com', 'cameralabs.com', 'dpreview.com', 'phonearena.com',
]);

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return null; }
}

function resolveUrl(url, brandUrl) {
  if (!url) return brandUrl || '#';
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    if (REVIEW_DOMAINS.has(domain)) return brandUrl || url;
  } catch {}
  return url;
}

function EmojiPlaceholder({ category }) {
  const map = {
    keyboard: '⌨️', backpack: '🎒', gpu: '🎮', headphones: '🎧', monitor: '🖥️', mouse: '🖱️',
    laptop: '💻', smartphone: '📱', speakers: '🔊', tablet: '📋', tv: '📺', bike: '🚲',
    'office-chair': '🪑', smartwatch: '⌚', 'running-shoes': '👟', microphone: '🎤',
    tripod: '📷', 'camera-flash': '⚡', 'camera-storage': '💾', 'field-monitor': '📹', 'camera-filter': '🔮',
    cpu: '🔲', motherboard: '🔧', ram: '🧩', ssd: '💿', psu: '⚡', 'pc-case': '🗃️', 'cpu-cooler': '❄️',
    'headphones-over-ear': '🎧', 'headphones-tws': '🎵', 'headphones-in-ear': '🎶',
    'headphones-on-ear': '🎼', 'headphones-gaming': '🕹️', 'air-fryer': '🍟',
  };
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
      <span style={{ fontSize: 48, opacity: 0.35 }}>{map[category] || '📦'}</span>
    </div>
  );
}

export default function ProductResults({ products, setProducts, marketSummary, category, mode, allQA, onReset, convertPrice = p => p, region, streaming = false, searchStatus = '' }) {
  const [selected, setSelected] = useState(new Set());
  const [showCompare, setShowCompare] = useState(false);

  function toggleSelect(i) {
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  const answeredQA = allQA.filter(qa => qa.answer && qa.answer !== 'No preference');
  const isLoading = streaming && products.length === 0;

  // Full-screen loading state while waiting for first product
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-24 w-full max-w-sm mx-auto anim-fadeup">
        <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%)' }} />
          <div className="absolute inset-1 rounded-full border-2" style={{ borderColor: 'rgba(99,102,241,.12)' }} />
          <div className="absolute inset-2 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <div className="absolute inset-5 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent-2)', animation: 'spin 1.6s linear infinite reverse' }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{searchStatus || 'Searching…'}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>First results will appear in a moment</p>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full" style={{ width: '40%', background: 'var(--gradient)', boxShadow: '0 0 10px rgba(99,102,241,.5)', animation: 'shimmer 1.8s linear infinite', backgroundSize: '400px 100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 flex flex-col gap-6 px-2 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 anim-fadeup">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
            {mode === 'vague' ? '⚡ Quick Match' : '🎯 Deep Dive'} — {LABELS[category] || category.replace(/\b\w/g, c => c.toUpperCase())}
            {region && ` · ${region.flag} ${region.country}`}
          </span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {streaming ? `${products.length} result${products.length !== 1 ? 's' : ''} found…` : `Your Top ${products.length} Picks`}
          </h1>
        </div>
        <button onClick={onReset} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          New search
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', color: '#d97706' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="m10.29 3.86-8.6 14.9A2 2 0 0 0 3.45 22h17.1a2 2 0 0 0 1.74-2.93l-8.6-14.9a2 2 0 0 0-3.4 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Prices and availability are <strong>approximate</strong> — always verify on the product page before purchasing. Links go directly to retailer listings.</span>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Your answers */}
        {answeredQA.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📋</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Your answers</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {answeredQA.map((qa, i) => (
                <div key={i} className="flex items-baseline gap-2 text-xs">
                  <span className="flex-shrink-0 font-medium" style={{ color: 'var(--text-faint)' }}>{qa.question.replace(/\?.*/, '?').slice(0, 40)}{qa.question.length > 40 ? '…' : ''}</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{qa.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market overview */}
        {marketSummary && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📊</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Market overview</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{marketSummary}</p>
          </div>
        )}
      </div>

      {!streaming && (
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          Tick cards to compare side by side · Click to view on retailer site
        </p>
      )}

      {/* Product grid — cards animate in as they arrive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={`${product.name}-${i}`}
            product={product}
            rank={i + 1}
            category={category}
            isSelected={selected.has(i)}
            onToggleSelect={() => toggleSelect(i)}
            convertPrice={convertPrice}
          />
        ))}
      </div>

      {/* Streaming indicator */}
      {streaming && (
        <div className="flex items-center justify-center gap-3 py-4 anim-fadein">
          <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{searchStatus || 'Finding more results…'}</span>
        </div>
      )}

      {/* Refine chat — only available after streaming completes */}
      {!streaming && (
        <ResultsChat
          category={category}
          mode={mode}
          allQA={allQA}
          currentProducts={products}
          onProductsUpdate={p => { setProducts(p); setSelected(new Set()); }}
          region={region}
        />
      )}

      {/* Compare bar */}
      {!streaming && selected.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: '0 8px 32px rgba(109,40,217,0.4)', minWidth: 320 }}>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">{selected.size} selected</div>
            <div className="text-white/70 text-xs">Compare side by side</div>
          </div>
          <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-xs px-2 transition-colors">Clear</button>
          <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-white hover:bg-white/90 transition-all" style={{ color: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            Compare Now
          </button>
        </div>
      )}

      {showCompare && <CompareModal products={[...selected].map(i => products[i])} onClose={() => setShowCompare(false)} convertPrice={convertPrice} />}
    </div>
  );
}

function ProductCard({ product, rank, category, isSelected, onToggleSelect, convertPrice }) {
  const [imgError, setImgError] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const rs = RANK_STYLE[rank];
  // Each card fades in when it arrives (streaming or not)
  const animDelay = `${Math.min((rank - 1) * 0.06, 0.4)}s`;

  const hasVariants = product.variants?.length > 1;
  const currentVariant = hasVariants ? product.variants[activeVariant] : null;
  const displayPrice = currentVariant?.price || product.price;
  const rawUrl = currentVariant?.url || product.url;
  const displayUrl = resolveUrl(rawUrl, product.brandUrl);
  const domain = getDomain(displayUrl);

  return (
    <div
      className="anim-scaleup rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      style={{
        animationDelay: animDelay,
        background: 'var(--surface)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isSelected ? '0 0 0 4px var(--accent-light), var(--shadow-md)' : 'var(--shadow)',
      }}
    >
      {/* Image */}
      <div className="relative flex-shrink-0" style={{ height: 200, background: 'var(--surface-2)' }}>
        {product.imageUrl && !imgError
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          : <EmojiPlaceholder category={category} />
        }
        {/* Rank */}
        {rs
          ? <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>{rs.label} #{rank}</div>
          : <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>#{rank}</div>
        }
        {/* Compare toggle */}
        <button
          onClick={onToggleSelect}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all font-bold text-xs backdrop-blur-sm"
          style={isSelected
            ? { background: 'var(--accent)', border: '2px solid white', color: 'white' }
            : { background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(0,0,0,0.1)', color: '#374151' }
          }
          title={isSelected ? 'Remove from compare' : 'Add to compare'}
        >
          {isSelected ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : '⇄'}
        </button>
        {/* Price */}
        {displayPrice && displayPrice !== 'Check price' && (
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm" style={{ background: 'rgba(22,163,74,0.9)', color: 'white' }}>
            {convertPrice(displayPrice)}
          </div>
        )}
        {/* Score */}
        {product.score && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
            {product.score}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text)' }}>{product.name}</h3>

        {/* Variants */}
        {hasVariants && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Configurations:</p>
            {product.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveVariant(i)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                style={activeVariant === i
                  ? { background: 'var(--accent-light)', border: '1px solid var(--accent)', color: 'var(--accent-text)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                }
              >
                <span className="font-medium truncate mr-2">{v.config}</span>
                <span className="font-bold flex-shrink-0" style={{ color: 'var(--green)' }}>{convertPrice(v.price)}</span>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{product.reason}</p>

        {/* Community */}
        {(product.pros?.length > 0 || product.communityNote) && (
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>⭐ What people say</p>
            {product.communityNote && <p className="text-xs italic mb-1.5" style={{ color: 'var(--text-muted)' }}>"{product.communityNote}"</p>}
            {product.pros?.slice(0, 2).map((p, i) => (
              <div key={i} className="flex gap-1.5 text-xs mb-0.5">
                <span style={{ color: 'var(--green)' }}>✓</span>
                <span style={{ color: 'var(--text-muted)' }}>{p}</span>
              </div>
            ))}
            {product.cons?.slice(0, 1).map((c, i) => (
              <div key={i} className="flex gap-1.5 text-xs">
                <span style={{ color: 'var(--red)' }}>✗</span>
                <span style={{ color: 'var(--text-muted)' }}>{c}</span>
              </div>
            ))}
          </div>
        )}

        {/* Specs */}
        {product.specs?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.specs.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-faint)' }}>{s}</span>
            ))}
          </div>
        )}

        {/* View button */}
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          View Product
          {domain && <span className="text-white/60 text-xs font-normal">· {domain}</span>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>
  );
}
