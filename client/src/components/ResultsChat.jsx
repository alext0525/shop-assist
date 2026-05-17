import { useState, useRef, useEffect } from 'react';
import { fetchJSON } from '../fetchJSON';

export default function ResultsChat({ category, mode, allQA, currentProducts, onProductsUpdate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Not quite right? Tell me what you'd like to change — e.g. "show me cheaper options", "I prefer wireless", or "the first one looks too big".` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const data = await fetchJSON('/api/search/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, mode, originalQA: allQA, currentProducts, feedback: text }),
      });
      setMessages(prev => [...prev, { role: 'assistant', text: data.message }]);
      if (data.products?.length) onProductsUpdate(data.products);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Sorry, I couldn't refine the results right now. ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full mt-4 rounded-2xl overflow-hidden transition-all" style={{ border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all"
        style={{ background: open ? 'var(--surface)' : 'var(--surface)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gradient-to-br from-violet-500 to-pink-500">
            ✨
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Refine with AI</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tell me what you'd like to change</div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-3 p-5 max-h-72 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5 bg-gradient-to-br from-violet-500 to-pink-500">✨</div>
                )}
                <div
                  className="max-w-xs text-sm px-4 py-2.5 rounded-2xl leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: 'var(--accent)', color: 'white', borderBottomRightRadius: '6px' }
                    : { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: '6px' }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-2 bg-gradient-to-br from-violet-500 to-pink-500">✨</div>
                <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="e.g. show me cheaper options, I prefer wireless..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
