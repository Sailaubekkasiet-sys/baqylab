'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/components/I18nProvider';

export default function NewLecturePage() {
    const { t } = useI18n();
    const router = useRouter();
    const { id: classId } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [resources, setResources] = useState<{ title: string, url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/lectures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, title, content, resources }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push(`/classes/${classId}`);
        } catch { setError(t('lecture.error')); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>{t('class.newLecture')}</h1>

            <Card padding="lg">
                {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label={t('lecture.titleLabel')} placeholder={t('lecture.introArrays')} value={title} onChange={e => setTitle(e.target.value)} required />
                    <TextArea label={t('lecture.contentLabel')} placeholder={t('lecture.contentPlaceholder')} value={content} onChange={e => setContent(e.target.value)} className="min-h-[300px]" />

                    <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('lecture.sources') || 'Источники и ссылки'}</label>
                        {resources.map((res, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input placeholder={t('lecture.sourceTitle') || 'Название'} value={res.title} onChange={e => {
                                        const newRes = [...resources];
                                        newRes[idx].title = e.target.value;
                                        setResources(newRes);
                                    }} />
                                    <Input placeholder={t('lecture.sourceUrl') || 'URL'} type="url" value={res.url} onChange={e => {
                                        const newRes = [...resources];
                                        newRes[idx].url = e.target.value;
                                        setResources(newRes);
                                    }} />
                                </div>
                                <Button type="button" variant="ghost" onClick={() => setResources(resources.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-600 px-3">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={() => setResources([...resources, { title: '', url: '' }])}>
                            + {t('lecture.addSource') || 'Добавить ссылку'}
                        </Button>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" loading={loading}>{t('lecture.create')}</Button>
                        <Button type="button" variant="ghost" onClick={() => router.back()}>{t('common.cancel')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
