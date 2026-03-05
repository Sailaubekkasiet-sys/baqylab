'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type AccessibilityContextType = {
    fontSizeMultiplier: number;
    setFontSizeMultiplier: (multiplier: number) => void;
    highContrast: boolean;
    setHighContrast: (enabled: boolean) => void;
    reducedMotion: boolean;
    setReducedMotion: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
    const [highContrast, setHighContrast] = useState<boolean>(false);
    const [reducedMotion, setReducedMotion] = useState<boolean>(false);

    // Load saved settings
    useEffect(() => {
        const savedFontSize = localStorage.getItem('__lms_fs_multiplier');
        const savedHighContrast = localStorage.getItem('__lms_hc');
        const savedReducedMotion = localStorage.getItem('__lms_rm');

        if (savedFontSize) setFontSizeMultiplier(parseFloat(savedFontSize));
        if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
        if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    }, []);

    // Apply settings to document
    useEffect(() => {
        const root = document.documentElement;

        // Font size (base rem scale)
        root.style.fontSize = `${fontSizeMultiplier * 100}%`;
        localStorage.setItem('__lms_fs_multiplier', fontSizeMultiplier.toString());

        // High contrast
        if (highContrast) {
            root.classList.add('high-contrast');
            localStorage.setItem('__lms_hc', 'true');
        } else {
            root.classList.remove('high-contrast');
            localStorage.setItem('__lms_hc', 'false');
        }

        // Reduced motion
        if (reducedMotion) {
            root.classList.add('reduced-motion');
            localStorage.setItem('__lms_rm', 'true');
        } else {
            root.classList.remove('reduced-motion');
            localStorage.setItem('__lms_rm', 'false');
        }
    }, [fontSizeMultiplier, highContrast, reducedMotion]);

    return (
        <AccessibilityContext.Provider value={{
            fontSizeMultiplier, setFontSizeMultiplier,
            highContrast, setHighContrast,
            reducedMotion, setReducedMotion
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
