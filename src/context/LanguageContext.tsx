'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Locale,
  translations,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  LOCAL_PRICES,
  formatCurrencyAmount,
} from '@/locales';

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  t: typeof translations.fr;
  formatPlanPrice: (planCode: string, isAnnual?: boolean) => string;
  formatCustomAmount: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Lecture de la langue depuis le cookie ou localStorage
        const savedLocale = (localStorage.getItem('lougara_locale') ||
          getCookie('NEXT_LOCALE')) as Locale;
        if (savedLocale === 'fr' || savedLocale === 'en') {
          setLocaleState(savedLocale);
        }

        // Lecture de la devise
        const savedCurrency = (localStorage.getItem('lougara_currency') ||
          getCookie('NEXT_CURRENCY')) as CurrencyCode;
        if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
          setCurrencyState(savedCurrency);
        }
      }
    } catch (e) {
      console.warn('Erreur lecture préférences i18n:', e);
    } finally {
      setMounted(true);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lougara_locale', newLocale);
        document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
      }
    } catch (e) {}
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lougara_currency', newCurrency);
        document.cookie = `NEXT_CURRENCY=${newCurrency};path=/;max-age=31536000;SameSite=Lax`;
      }
    } catch (e) {}
  };

  const formatPlanPrice = (planCode: string, isAnnual: boolean = false): string => {
    const planPrices = LOCAL_PRICES[planCode];
    if (!planPrices) return '0 €';

    const priceEntry = planPrices[currency] || planPrices.EUR;
    const amount = isAnnual ? priceEntry.annual : priceEntry.monthly;

    return formatCurrencyAmount(amount, currency);
  };

  const formatCustomAmount = (amount: number): string => {
    return formatCurrencyAmount(amount, currency);
  };

  const currentTranslation = translations[locale] || translations.fr;

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        currency,
        setCurrency,
        t: currentTranslation,
        formatPlanPrice,
        formatCustomAmount,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage doit être utilisé au sein d\'un LanguageProvider');
  }
  return context;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
