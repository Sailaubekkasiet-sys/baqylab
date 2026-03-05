'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200',
                            'focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
                            'placeholder:text-[var(--text-tertiary)]',
                            !!icon && 'pl-10',
                            error && 'border-red-500 focus:ring-red-500/30',
                            className
                        )}
                        style={{
                            background: 'var(--bg-secondary)',
                            borderColor: error ? undefined : 'var(--border-default)',
                            color: 'var(--text-primary)',
                        }}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200 resize-y min-h-[100px]',
                        'focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
                        'placeholder:text-[var(--text-tertiary)]',
                        error && 'border-red-500 focus:ring-red-500/30',
                        className
                    )}
                    style={{
                        background: 'var(--bg-secondary)',
                        borderColor: error ? undefined : 'var(--border-default)',
                        color: 'var(--text-primary)',
                    }}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {label}
                    </label>
                )}
                <select
                    ref={ref as any}
                    id={inputId}
                    className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200',
                        'focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
                        className
                    )}
                    style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-primary)',
                    }}
                    {...(props as any)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
