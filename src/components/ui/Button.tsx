'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

        const variantClasses = {
            primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]',
            secondary: 'border hover:shadow-sm active:scale-[0.98]',
            ghost: 'hover:opacity-80',
            danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98]',
        };

        const sizeClasses = {
            sm: 'text-xs px-3 py-1.5 gap-1.5',
            md: 'text-sm px-4 py-2 gap-2',
            lg: 'text-base px-6 py-3 gap-2',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
                style={{
                    ...(variant === 'secondary'
                        ? { background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }
                        : variant === 'ghost'
                            ? { color: 'var(--text-secondary)' }
                            : {}),
                }}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
