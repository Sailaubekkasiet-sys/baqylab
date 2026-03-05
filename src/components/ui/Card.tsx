import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, padding = 'md', onClick, style }: CardProps) {
    const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

    return (
        <div
            className={cn(
                'glass-card',
                paddings[padding],
                hover && 'hover:shadow-md hover:border-[var(--border-hover)] cursor-pointer transition-all duration-200',
                className
            )}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={cn('text-lg font-semibold', className)} style={{ color: 'var(--text-primary)' }}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn('text-sm mt-1', className)} style={{ color: 'var(--text-secondary)' }}>
            {children}
        </p>
    );
}
