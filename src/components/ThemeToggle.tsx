'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useI18n } from '@/components/I18nProvider';

export function ThemeToggle() {
    const { t } = useI18n();
    const { theme, setTheme } = useTheme();

    const options: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
        { value: 'light', icon: <Sun size={16} />, label: t('theme.light') },
        { value: 'dark', icon: <Moon size={16} />, label: t('theme.dark') },
        { value: 'system', icon: <Monitor size={16} />, label: t('theme.system') },
    ];

    return (
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    title={opt.label}
                    className={`
            flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium
            transition-all duration-200
            ${theme === opt.value
                            ? 'shadow-sm text-brand-600 dark:text-brand-400'
                            : 'hover:opacity-80'
                        }
          `}
                    style={{
                        background: theme === opt.value ? 'var(--bg-card)' : 'transparent',
                        color: theme === opt.value ? undefined : 'var(--text-secondary)',
                    }}
                >
                    <span>{opt.icon}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                </button>
            ))}
        </div>
    );
}
