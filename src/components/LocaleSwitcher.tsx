'use client';

import { useI18n } from './I18nProvider';
import { Locale } from '@/lib/i18n';

export function LocaleSwitcher() {
    const { locale, setLocale } = useI18n();

    const options: { value: Locale; label: string }[] = [
        { value: 'ru', label: 'RU' },
        { value: 'kz', label: 'KZ' },
        { value: 'en', label: 'EN' },
    ];

    return (
        <div className="flex items-center gap-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setLocale(opt.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${locale === opt.value
                            ? 'bg-brand-500 text-white'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
