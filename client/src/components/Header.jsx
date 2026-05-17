export default function Header({ onReset, showReset, isDark, setIsDark }) {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3.5 sticky top-0 z-40" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <button onClick={onReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-xl">🛍️</span>
        <span className="text-base font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
          ShopAssist
        </span>
      </button>

      <div className="flex items-center gap-2">
        {showReset && (
          <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
            Start over
          </button>
        )}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
