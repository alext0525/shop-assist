import { useState, useEffect } from 'react';

export const REGIONS = [
  { country: 'Netherlands', code: 'NL', currency: 'EUR', locale: 'nl-NL', flag: '🇳🇱', stores: 'bol.com, coolblue.nl, amazon.nl' },
  { country: 'Germany',     code: 'DE', currency: 'EUR', locale: 'de-DE', flag: '🇩🇪', stores: 'amazon.de, mediamarkt.de' },
  { country: 'France',      code: 'FR', currency: 'EUR', locale: 'fr-FR', flag: '🇫🇷', stores: 'amazon.fr, fnac.com' },
  { country: 'Belgium',     code: 'BE', currency: 'EUR', locale: 'nl-BE', flag: '🇧🇪', stores: 'bol.com, coolblue.be' },
  { country: 'Spain',       code: 'ES', currency: 'EUR', locale: 'es-ES', flag: '🇪🇸', stores: 'amazon.es, pccomponentes.com' },
  { country: 'Italy',       code: 'IT', currency: 'EUR', locale: 'it-IT', flag: '🇮🇹', stores: 'amazon.it' },
  { country: 'Poland',      code: 'PL', currency: 'PLN', locale: 'pl-PL', flag: '🇵🇱', stores: 'allegro.pl, amazon.pl, x-kom.pl' },
  { country: 'United Kingdom', code: 'GB', currency: 'GBP', locale: 'en-GB', flag: '🇬🇧', stores: 'amazon.co.uk, currys.co.uk' },
  { country: 'United States',  code: 'US', currency: 'USD', locale: 'en-US', flag: '🇺🇸', stores: 'amazon.com, bestbuy.com, newegg.com' },
  { country: 'Canada',      code: 'CA', currency: 'CAD', locale: 'en-CA', flag: '🇨🇦', stores: 'amazon.ca, bestbuy.ca' },
  { country: 'Australia',   code: 'AU', currency: 'AUD', locale: 'en-AU', flag: '🇦🇺', stores: 'amazon.com.au, jbhifi.com.au' },
  { country: 'Switzerland', code: 'CH', currency: 'CHF', locale: 'de-CH', flag: '🇨🇭', stores: 'digitec.ch, amazon.de' },
  { country: 'Sweden',      code: 'SE', currency: 'SEK', locale: 'sv-SE', flag: '🇸🇪', stores: 'amazon.se, elgiganten.se' },
  { country: 'Norway',      code: 'NO', currency: 'NOK', locale: 'nb-NO', flag: '🇳🇴', stores: 'komplett.no, amazon.de' },
  { country: 'Denmark',     code: 'DK', currency: 'DKK', locale: 'da-DK', flag: '🇩🇰', stores: 'proshop.dk, amazon.de' },
  { country: 'Japan',       code: 'JP', currency: 'JPY', locale: 'ja-JP', flag: '🇯🇵', stores: 'amazon.co.jp' },
  { country: 'Singapore',   code: 'SG', currency: 'SGD', locale: 'en-SG', flag: '🇸🇬', stores: 'lazada.sg, amazon.sg' },
];

const DEFAULT_REGION = REGIONS.find(r => r.code === 'US');

function loadSaved() {
  try {
    const s = localStorage.getItem('shopregion');
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

async function autoDetect() {
  const apis = [
    async () => { const d = await (await fetch('https://ipwho.is/')).json(); if (!d.success) throw 0; return d.country_code; },
    async () => { const d = await (await fetch('https://ipapi.co/json/')).json(); if (!d.country_code) throw 0; return d.country_code; },
    async () => { const d = await (await fetch('https://freeipapi.com/api/json/')).json(); if (!d.countryCode) throw 0; return d.countryCode; },
  ];
  for (const api of apis) {
    try { return await api(); } catch {}
  }
  return null;
}

export function useCurrency() {
  const [region, setRegionState] = useState(() => loadSaved() || DEFAULT_REGION);
  const [rates, setRates] = useState({});
  const [detected, setDetected] = useState(false);

  // Fetch exchange rates once
  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=USD')
      .then(r => r.json())
      .then(d => setRates({ USD: 1, ...d.rates }))
      .catch(() => {});
  }, []);

  // Auto-detect only if user hasn't manually chosen
  useEffect(() => {
    if (loadSaved()) return; // user already chose
    autoDetect().then(cc => {
      if (!cc) return;
      const match = REGIONS.find(r => r.code === cc);
      if (match) { setRegionState(match); setDetected(true); }
    });
  }, []);

  function setRegion(r) {
    setRegionState(r);
    localStorage.setItem('shopregion', JSON.stringify(r));
  }

  function convertPrice(priceStr) {
    if (!priceStr || priceStr === 'Check price') return priceStr;
    if (region.currency === 'USD' && !rates[region.currency]) return priceStr;

    const match = priceStr.match(/([\d,]+\.?\d*)/);
    if (!match) return priceStr;
    const usd = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(usd)) return priceStr;

    const rate = rates[region.currency] ?? 1;
    const converted = usd * rate;

    const formatted = new Intl.NumberFormat(region.locale, {
      style: 'currency', currency: region.currency, maximumFractionDigits: 0,
    }).format(converted);

    const prefix = priceStr.match(/^[^$\d]*/)?.[0] ?? '';
    return prefix + formatted;
  }

  return { region, setRegion, convertPrice, detected };
}
