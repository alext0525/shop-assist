import { useState, useEffect } from 'react';

const DEFAULT = { code: 'USD', rate: 1, locale: 'en-US', country: null };

async function detectCurrency() {
  // Try multiple free IP geolocation APIs in order
  const geoAPIs = [
    async () => {
      const r = await fetch('https://ipwho.is/');
      const d = await r.json();
      if (!d.success) throw new Error('ipwho failed');
      return { currency: d.currency?.code, languages: d.country, locale: d.languages };
    },
    async () => {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      if (!d.currency) throw new Error('ipapi failed');
      return { currency: d.currency, languages: d.languages, locale: d.languages?.split(',')[0] };
    },
    async () => {
      const r = await fetch('https://freeipapi.com/api/json/');
      const d = await r.json();
      if (!d.currencyCode) throw new Error('freeipapi failed');
      return { currency: d.currencyCode, languages: null, locale: d.language };
    },
  ];

  let geo = null;
  for (const api of geoAPIs) {
    try { geo = await api(); break; } catch { /* try next */ }
  }
  if (!geo?.currency) return null;

  const ratesRes = await fetch('https://api.frankfurter.app/latest?from=USD');
  const rates = await ratesRes.json();

  const code = geo.currency;
  const rate = code === 'USD' ? 1 : (rates.rates[code] ?? 1);
  const locale = geo.locale?.split(',')[0]?.replace('_', '-') ?? 'en-US';

  return { code, rate, locale };
}

export function useCurrency() {
  const [currency, setCurrency] = useState(DEFAULT);

  useEffect(() => {
    detectCurrency()
      .then(c => { if (c) setCurrency({ ...c, country: true }); })
      .catch(() => {}); // stay on USD
  }, []);

  function convertPrice(priceStr) {
    if (!priceStr || priceStr === 'Check price') return priceStr;
    if (currency.code === 'USD') return priceStr;

    const match = priceStr.match(/([\d,]+\.?\d*)/);
    if (!match) return priceStr;

    const usd = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(usd)) return priceStr;

    const converted = usd * currency.rate;
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(converted);

    const prefix = priceStr.match(/^[^$\d]*/)?.[0] ?? '';
    return prefix + formatted;
  }

  return { currency, convertPrice };
}
