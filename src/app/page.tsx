'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/I18nProvider';

const icons = {
    rubric: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
    code: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>,
    version: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
    check: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    map: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>,
    bot: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" /></svg>,
};

export default function LandingPage() {
    const { data: session, status } = useSession();
    const { t } = useI18n();

    if (status === 'authenticated') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 pt-24 pb-24">
            {/* Hero */}
            <div className="animate-fade-in max-w-3xl">


                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                    <span style={{ color: 'var(--text-primary)' }}>{t('landing.title1')} </span>
                    <span className="gradient-text">{t('landing.title2')}</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
                    {t('landing.subtitle')}
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                        <Button size="lg" className="glow text-base px-8 flex items-center gap-2">
                            <span>{t('landing.cta')}</span>
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="secondary" size="lg" className="text-base px-8 flex items-center gap-2">
                            <span>{t('landing.signIn')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-5xl w-full animate-slide-up">
                {[
                    { icon: icons.rubric, title: t('landing.f1.title'), desc: t('landing.f1.desc') },
                    { icon: icons.code, title: t('landing.f2.title'), desc: t('landing.f2.desc') },
                    { icon: icons.version, title: t('landing.f3.title'), desc: t('landing.f3.desc') },
                    { icon: icons.check, title: t('landing.f4.title'), desc: t('landing.f4.desc') },
                    { icon: icons.map, title: t('landing.f5.title'), desc: t('landing.f5.desc') },
                    { icon: icons.bot, title: t('landing.f6.title'), desc: t('landing.f6.desc') },
                ].map((f) => (
                    <div
                        key={f.title}
                        className="glass-card p-6 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="text-brand-500 mb-4">{f.icon}</div>
                        <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
