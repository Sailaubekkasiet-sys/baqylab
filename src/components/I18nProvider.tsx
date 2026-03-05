'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, Locale } from '@/lib/i18n';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
    locale: 'ru',
    setLocale: () => { },
    t: (key) => key,
});

export function useI18n() {
    return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ru');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('teachera-locale') as Locale | null;
        if (saved && translations[saved]) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('teachera-locale', newLocale);
    };

    const t = (key: string): string => {
        return translations[locale]?.[key] || translations['ru']?.[key] || key;
    };

    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}
