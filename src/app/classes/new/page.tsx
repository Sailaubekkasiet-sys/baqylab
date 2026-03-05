'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/components/I18nProvider';

export default function NewClassPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push(`/classes/${data.class.id}`);
        } catch {
            setError(t('dash.errCreateClass'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {t('dash.createClass')}
            </h1>

            <Card padding="lg">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label={t('class.nameLabel')}
                        placeholder={t('class.exampleTitle')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextArea
                        label={t('class.descLabel')}
                        placeholder={t('class.shortDesc')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={loading}>{t('dash.createClassBtn')}</Button>
                        <Button type="button" variant="ghost" onClick={() => router.back()}>{t('common.cancel')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
