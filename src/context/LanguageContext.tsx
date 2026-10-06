'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bdneeds_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved === 'en' || saved === 'bn') {
        setLanguageState(saved);
      }
    } catch {
      // LocalStorage access fails in SSR
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    return (dict as Record<string, string>)[key] || fallback || (translations.en as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5 text-xs font-semibold backdrop-blur-xs cursor-pointer ${className}`}
    >
      <span
        className={`px-2 py-0.5 rounded-md transition-all ${
          language === 'en'
            ? 'bg-[#0B132B] text-[#ffffff] shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="English"
      >
        EN
      </span>
      <span
        className={`px-2 py-0.5 rounded-md transition-all ${
          language === 'bn'
            ? 'bg-blue-600 text-[#ffffff] shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="বাংলা (Bengali)"
      >
        বাংলা
      </span>
    </button>
  );
}
