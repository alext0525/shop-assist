import { useState, useEffect } from 'react';

const DEFAULT = { code: 'USD', rate: 1, locale: 'en-US', country: null };

export function useCurrency() {
  const [currency, setCurrency] = useState(DEFAULT);

  useEffect(() => {
    async function detect() {
      try {
        const [geoRes, ratesRes] = await Promise.all([
          fetch('https://ipapi.co/json/'),
          fetch('https://api.frankfurter.app/latest?from=USD'),
        ]);
        const geo = await geoRes.json();
        const rates = await ratesRes.json();

        const code = geo.currency || 'USD';
        const rate = code === 'USD' ? 1 : (rates.rates[code] ?? 1);
        const locale = geo.languages?.split(',')[0] ?? 'en-US';

        setCurrency({ code, rate, locale, country: geo.country_name });
      } catch {
        // stay on USD default
      }
    }
    detect();
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

    // preserve leading modifier (~, From , etc.)
    const prefix = priceStr.match(/^[^$\d]*/)?.[0] ?? '';
    return prefix + formatted;
  }

  return { currency, convertPrice };
}
