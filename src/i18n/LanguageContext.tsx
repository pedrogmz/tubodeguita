import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  Translations,
  translations,
  categoryTranslations,
  unitTranslations,
  paymentMethodTranslations,
} from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  translateCategory: (category: string) => string;
  translateUnit: (unit: string) => string;
  translatePaymentMethod: (method: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'smartshop_terminal_language_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'es';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Also update document lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const currentTranslations = translations[language] || translations.es;

  const translateCategory = (cat: string): string => {
    if (categoryTranslations[cat]) {
      return categoryTranslations[cat][language] || cat;
    }
    return cat;
  };

  const translateUnit = (unit: string): string => {
    if (unitTranslations[unit]) {
      return unitTranslations[unit][language] || unit;
    }
    return unit;
  };

  const translatePaymentMethod = (method: string): string => {
    if (paymentMethodTranslations[method]) {
      return paymentMethodTranslations[method][language] || method;
    }
    return method;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentTranslations,
        translateCategory,
        translateUnit,
        translatePaymentMethod,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
