import { useState, useEffect } from 'react';

export const REGIONS = [
  { country: 'Netherlands',    code: 'NL', currency: 'EUR', locale: 'nl-NL', language: 'nl', languageName: 'Dutch',      flag: '🇳🇱', stores: 'bol.com, coolblue.nl, amazon.nl' },
  { country: 'Germany',        code: 'DE', currency: 'EUR', locale: 'de-DE', language: 'de', languageName: 'German',     flag: '🇩🇪', stores: 'amazon.de, mediamarkt.de' },
  { country: 'France',         code: 'FR', currency: 'EUR', locale: 'fr-FR', language: 'fr', languageName: 'French',     flag: '🇫🇷', stores: 'amazon.fr, fnac.com' },
  { country: 'Belgium',        code: 'BE', currency: 'EUR', locale: 'nl-BE', language: 'nl', languageName: 'Dutch',      flag: '🇧🇪', stores: 'bol.com, coolblue.be' },
  { country: 'Spain',          code: 'ES', currency: 'EUR', locale: 'es-ES', language: 'es', languageName: 'Spanish',    flag: '🇪🇸', stores: 'amazon.es, pccomponentes.com' },
  { country: 'Italy',          code: 'IT', currency: 'EUR', locale: 'it-IT', language: 'it', languageName: 'Italian',    flag: '🇮🇹', stores: 'amazon.it' },
  { country: 'Poland',         code: 'PL', currency: 'PLN', locale: 'pl-PL', language: 'pl', languageName: 'Polish',     flag: '🇵🇱', stores: 'allegro.pl, amazon.pl, x-kom.pl' },
  { country: 'United Kingdom', code: 'GB', currency: 'GBP', locale: 'en-GB', language: 'en', languageName: 'English',   flag: '🇬🇧', stores: 'amazon.co.uk, currys.co.uk' },
  { country: 'United States',  code: 'US', currency: 'USD', locale: 'en-US', language: 'en', languageName: 'English',   flag: '🇺🇸', stores: 'amazon.com, bestbuy.com, newegg.com' },
  { country: 'Canada',         code: 'CA', currency: 'CAD', locale: 'en-CA', language: 'en', languageName: 'English',   flag: '🇨🇦', stores: 'amazon.ca, bestbuy.ca' },
  { country: 'Australia',      code: 'AU', currency: 'AUD', locale: 'en-AU', language: 'en', languageName: 'English',   flag: '🇦🇺', stores: 'amazon.com.au, jbhifi.com.au' },
  { country: 'Switzerland',    code: 'CH', currency: 'CHF', locale: 'de-CH', language: 'de', languageName: 'German',    flag: '🇨🇭', stores: 'digitec.ch, amazon.de' },
  { country: 'Sweden',         code: 'SE', currency: 'SEK', locale: 'sv-SE', language: 'sv', languageName: 'Swedish',   flag: '🇸🇪', stores: 'amazon.se, elgiganten.se' },
  { country: 'Norway',         code: 'NO', currency: 'NOK', locale: 'nb-NO', language: 'nb', languageName: 'Norwegian', flag: '🇳🇴', stores: 'komplett.no, amazon.de' },
  { country: 'Denmark',        code: 'DK', currency: 'DKK', locale: 'da-DK', language: 'da', languageName: 'Danish',   flag: '🇩🇰', stores: 'proshop.dk, amazon.de' },
  { country: 'Japan',          code: 'JP', currency: 'JPY', locale: 'ja-JP', language: 'en', languageName: 'English',  flag: '🇯🇵', stores: 'amazon.co.jp' },
  { country: 'Singapore',      code: 'SG', currency: 'SGD', locale: 'en-SG', language: 'en', languageName: 'English',  flag: '🇸🇬', stores: 'lazada.sg, amazon.sg' },
];

const DEFAULT_REGION = REGIONS.find(r => r.code === 'US');

function loadSaved() {
  try {
    const s = localStorage.getItem('shopregion');
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

function loadSavedLang() {
  try { return localStorage.getItem('shoplang') || null; } catch { return null; }
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
  const [preferredLanguage, setPreferredLanguageState] = useState(() => loadSavedLang());

  // User can override the region's default language independently
  const language = preferredLanguage || region?.language || 'en';
  const languageName = (() => {
    // find the languageName for the active language code
    const match = Object.values(region || {}).length && language === region?.language
      ? region?.languageName
      : null;
    const LANG_NAMES = { en:'English', de:'German', fr:'French', nl:'Dutch', es:'Spanish', it:'Italian', pl:'Polish', sv:'Swedish', nb:'Norwegian', da:'Danish' };
    return match || LANG_NAMES[language] || 'English';
  })();

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
    // When user explicitly picks a new region, clear language override so
    // the new region's default language applies (unless user has already
    // set a language override, in which case keep it)
  }

  function setLanguage(code) {
    setPreferredLanguageState(code);
    localStorage.setItem('shoplang', code);
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

  return { region, setRegion, convertPrice, detected, language, languageName, setLanguage };
}
