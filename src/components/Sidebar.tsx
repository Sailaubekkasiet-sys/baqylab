'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useI18n } from './I18nProvider';

// We use an SVG string renderer for icons since we removed emojis
const icons: Record<string, any> = {
    dashboard: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
    classes: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
    join: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>,
    add: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    sandbox: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>,
    grades: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    skills: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>,
    bot: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" /></svg>,
};

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { t } = useI18n();
    const role = (session?.user as any)?.role;

    if (!session) return null;

    const navItems = [
        { href: '/dashboard', labelKey: 'nav.dashboard', iconKey: 'dashboard' },
        { href: '/classes', labelKey: 'nav.classes', iconKey: 'classes' },
        { href: '/join', labelKey: 'nav.join', iconKey: 'join', roles: ['STUDENT'] },
        { href: '/classes/new', labelKey: 'nav.newClass', iconKey: 'add', roles: ['TEACHER'] },
        { href: '/grades', labelKey: 'nav.grades', iconKey: 'grades', roles: ['STUDENT'] },
        { href: '/skills', labelKey: 'nav.skills', iconKey: 'skills', roles: ['STUDENT'] },
        { href: '/sandbox', labelKey: 'nav.sandbox', iconKey: 'sandbox' },
        { href: 'https://t.me/BaqyLab_bot', labelKey: 'nav.bot', iconKey: 'bot', external: true },
    ];

    const filteredItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(role)
    );

    return (
        <aside
            className="fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col w-64 border-r h-screen p-4"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
        >
            <nav className="space-y-1 flex-1">
                {filteredItems.map((item) => {
                    const isActive = !item.external && (pathname === item.href || pathname.startsWith(item.href + '/'));

                    const classes = cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive ? 'shadow-sm' : 'hover:opacity-80'
                    );
                    const style = {
                        background: isActive ? 'var(--bg-card)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        ...(isActive ? { borderLeft: '3px solid var(--brand-500)' } : {}),
                    };

                    if (item.external) {
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                className={classes}
                                style={style}
                            >
                                <span className="text-zinc-500 dark:text-zinc-400">{icons[item.iconKey]}</span>
                                <span>{t(item.labelKey)}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classes}
                            style={style}
                        >
                            <span className={isActive ? 'text-brand-500' : 'text-zinc-500 dark:text-zinc-400'}>
                                {icons[item.iconKey]}
                            </span>
                            <span>{t(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom info */}
            <div
                className="mt-auto pt-4 border-t text-xs"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}
            >
                <p className="font-medium text-brand-500">{t('app.name')} LMS</p>
                <p className="mt-0.5">{t('app.tagline')}</p>
            </div>
        </aside>
    );
}

// Mobile bottom navigation
export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { t } = useI18n();
    const role = (session?.user as any)?.role;

    if (!session) return null;

    const navItems = [
        { href: '/dashboard', labelKey: 'nav.dashboard', iconKey: 'dashboard' },
        { href: '/classes', labelKey: 'nav.classes', iconKey: 'classes' },
        { href: '/join', labelKey: 'nav.join', iconKey: 'join', roles: ['STUDENT'] },
        { href: '/classes/new', labelKey: 'nav.newClass', iconKey: 'add', roles: ['TEACHER'] },
        { href: '/grades', labelKey: 'nav.grades', iconKey: 'grades', roles: ['STUDENT'] },
        { href: '/skills', labelKey: 'nav.skills', iconKey: 'skills', roles: ['STUDENT'] },
        { href: 'https://t.me/BaqyLab_bot', labelKey: 'nav.bot', iconKey: 'bot', external: true },
    ];

    const mobileItems = navItems
        .filter((item) => !item.roles || item.roles.includes(role))
        .slice(0, 5);

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
            {mobileItems.map((item) => {
                const isActive = !item.external && (pathname === item.href || pathname.startsWith(item.href + '/'));

                const classes = cn('flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-all');
                const color = isActive ? 'var(--brand-500)' : 'var(--text-tertiary)';

                if (item.external) {
                    return (
                        <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={classes} style={{ color }}>
                            <span className="w-5 h-5">{icons[item.iconKey]}</span>
                            <span className="truncate max-w-[60px]">{t(item.labelKey)}</span>
                        </a>
                    );
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={classes}
                        style={{ color }}
                    >
                        <span className="w-5 h-5">{icons[item.iconKey]}</span>
                        <span className="truncate max-w-[60px]">{t(item.labelKey)}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
