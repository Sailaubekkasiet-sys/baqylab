'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/components/I18nProvider';

export default function JoinClassPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return;
            }

            setSuccess(`${t('join.joinedClass')} "${data.className}"!`);
            setTimeout(() => router.push(`/classes/${data.classId}`), 1500);
        } catch {
            setError(t('join.errConnect'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 19.5v-13h-1.5M13.5 19.5v-13h-1.5m-5.25v13h-1.5M3 6.5h18" /></svg>
                {t('dash.joinClass')}
            </h1>

            <Card padding="lg">
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('join.enterCode')}</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label={t('join.classCode')}
                        placeholder={t('join.codeExample')}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                        className="text-center text-2xl tracking-[0.3em] font-mono uppercase"
                    />
                    <Button type="submit" className="w-full" loading={loading}>{t('nav.join')}</Button>
                </form>
            </Card>
        </div>
    );
}
