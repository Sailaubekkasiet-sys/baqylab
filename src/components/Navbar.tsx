'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useI18n } from './I18nProvider';
import { Button } from './ui/Button';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

export function Navbar() {
    const { data: session } = useSession();
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header
            className="sticky top-0 z-40 border-b backdrop-blur-md"
            style={{
                background: 'rgba(var(--bg-primary), 0.8)',
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-default)',
            }}
        >
            <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1600px] mx-auto">
                {/* Logo */}
                <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-all shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold gradient-text hidden sm:inline">BaqyLab</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <LocaleSwitcher />
                    <ThemeToggle />

                    {session ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:shadow-sm"
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                        {getInitials(session.user?.name || 'U')}
                                    </span>
                                </div>
                                <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--text-primary)' }}>
                                    {session.user?.name}
                                </span>
                                <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div
                                        className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-20 border py-1 animate-slide-up"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                                    >
                                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-default)' }}>
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                                {(session.user as any)?.role === 'TEACHER' ? t('role.teacher') : t('role.student')}
                                            </p>
                                            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                                                {session.user?.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                {t('nav.dashboard')}
                                            </div>
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                                {t('nav.profile')}
                                            </div>
                                        </Link>
                                        <a
                                            href="https://t.me/BaqyLab_bot"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                {t('nav.bot')}
                                            </div>
                                        </a>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            {t('nav.signOut')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">{t('nav.register')}</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
