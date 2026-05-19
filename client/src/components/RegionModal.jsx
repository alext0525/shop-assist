import { useEffect, useRef } from 'react';
import { REGIONS } from '../hooks/useCurrency';
import { LANGUAGES, getTranslations } from '../i18n';

export default function RegionModal({ region, setRegion, language, setLanguage, onClose }) {
  const ref = useRef(null);
  const t = getTranslations(language);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div ref={ref} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{t.regionTitle}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.regionDesc}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* ── Region list ──────────────────────────────── */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-bold uppercase tracking-wider px-1 pb-2" style={{ color: 'var(--text-faint)' }}>
              {t.regionSection}
            </p>
            {REGIONS.map((r) => {
              const isSelected = r.code === region.code;
              return (
                <button
                  key={r.code}
                  onClick={() => { setRegion(r); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-1"
                  style={isSelected ? {
                    background: 'var(--accent-light)',
                    border: '1px solid var(--accent)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-xl">{r.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.country}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{r.stores}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={isSelected ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {r.currency}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Language picker ───────────────────────────── */}
          <div className="px-3 pt-2 pb-4" style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <p className="text-xs font-bold uppercase tracking-wider px-1 pt-3 pb-2" style={{ color: 'var(--text-faint)' }}>
              {t.langSection}
            </p>
            <p className="text-xs px-1 mb-3" style={{ color: 'var(--text-muted)' }}>
              {t.langDesc}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={isSelected ? {
                      background: 'var(--accent-light)',
                      border: '1.5px solid var(--accent)',
                    } : {
                      background: 'var(--surface-2)',
                      border: '1.5px solid var(--border)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <span style={{ fontSize: 18 }}>{lang.flag}</span>
                    <span className="text-sm font-medium" style={{ color: isSelected ? 'var(--accent-text)' : 'var(--text-muted)' }}>
                      {lang.label}
                    </span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" className="ml-auto flex-shrink-0">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
