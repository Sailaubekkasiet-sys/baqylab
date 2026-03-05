'use client';

import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

export function AccessibilityPanel() {
    const {
        fontSizeMultiplier, setFontSizeMultiplier,
        highContrast, setHighContrast,
        reducedMotion, setReducedMotion
    } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);

    // Hardcoded strings for panel (could use i18n later)
    const t = (key: string) => {
        const dict: Record<string, string> = {
            'a11y.title': 'Специальные возможности',
            'a11y.fontSize': 'Масштаб текста',
            'a11y.highContrast': 'Высокая контрастность',
            'a11y.reducedMotion': 'Уменьшение анимации',
            'a11y.close': 'Закрыть',
        };
        return dict[key] || key;
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${highContrast ? 'bg-black text-yellow-500 border-4 border-yellow-500' : 'bg-brand-500 text-white'}`}
                aria-label={t('a11y.title')}
                title={t('a11y.title')}
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>

            {/* Modal Panel */}
            {isOpen && (
                <div className={`absolute bottom-20 right-0 w-80 p-5 rounded-2xl shadow-2xl border ${highContrast ? 'bg-black border-yellow-500 text-yellow-500' : 'bg-bg-card border-border-default text-text-primary'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">{t('a11y.title')}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`p-1 rounded-md ${highContrast ? 'hover:bg-yellow-500 hover:text-black' : 'hover:bg-bg-secondary'}`}
                            aria-label={t('a11y.close')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Font Size */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">{t('a11y.fontSize')}</label>
                            <div className="flex gap-2">
                                {[1, 1.25, 1.5].map((mult) => (
                                    <button
                                        key={mult}
                                        onClick={() => setFontSizeMultiplier(mult)}
                                        className={`flex-1 py-2 text-center rounded-lg border-2 font-medium transition-colors ${fontSizeMultiplier === mult
                                            ? (highContrast ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-brand-500 text-white border-brand-500')
                                            : (highContrast ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/20' : 'border-border-default text-text-secondary hover:bg-bg-secondary')
                                            }`}
                                    >
                                        {mult}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* High Contrast */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="hc-toggle" className="text-sm font-semibold cursor-pointer select-none">
                                {t('a11y.highContrast')}
                            </label>
                            <div
                                id="hc-toggle"
                                className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${highContrast ? (highContrast ? 'bg-yellow-500' : 'bg-brand-500') : 'bg-gray-300 dark:bg-gray-600'}`}
                                onClick={() => setHighContrast(!highContrast)}
                                role="switch"
                                aria-checked={highContrast}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHighContrast(!highContrast); } }}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${highContrast ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white'}`} />
                            </div>
                        </div>

                        {/* Reduced Motion */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="rm-toggle" className="text-sm font-semibold cursor-pointer select-none">
                                {t('a11y.reducedMotion')}
                            </label>
                            <div
                                id="rm-toggle"
                                className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${reducedMotion ? (highContrast ? 'bg-yellow-500' : 'bg-brand-500') : 'bg-gray-300 dark:bg-gray-600'}`}
                                onClick={() => setReducedMotion(!reducedMotion)}
                                role="switch"
                                aria-checked={reducedMotion}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReducedMotion(!reducedMotion); } }}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${reducedMotion ? 'translate-x-7 bg-black' : 'translate-x-1 bg-white'}`} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
