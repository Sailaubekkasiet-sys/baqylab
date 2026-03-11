'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/components/I18nProvider';
import { useSession } from 'next-auth/react';

export default function EditLecturePage() {
    const { t } = useI18n();
    const router = useRouter();
    const { id: classId, lid: lectureId } = useParams();
    const { data: session } = useSession();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [resources, setResources] = useState<{ title: string, url: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [initialFetchLoading, setInitialFetchLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!classId || !lectureId) return;

        fetch(`/api/lectures/${lectureId}`)
            .then(res => res.json())
            .then(data => {
                const l = data.lecture;
                if (!l) {
                    setError('Lecture not found');
                    return;
                }
                setTitle(l.title || '');
                setContent(l.content || '');
                if (l.resources && l.resources !== '[]') {
                    try {
                        setResources(JSON.parse(l.resources));
                    } catch (e) { }
                }
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch lecture');
            })
            .finally(() => {
                setInitialFetchLoading(false);
            });
    }, [classId, lectureId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/lectures/${lectureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, resources }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push(`/classes/${classId}/lectures/${lectureId}`);
        } catch {
            setError(t('lecture.error') || 'An error occurred saving the lecture.');
        } finally {
            setLoading(false);
        }
    };

    if (initialFetchLoading) {
        return <div className="text-center py-20 animate-pulse-soft">{t('common.loading')}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pb-10">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('lecture.editTitle')}
            </h1>

            <Card padding="lg">
                {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label={t('lecture.titleLabel')} placeholder={t('lecture.introArrays')} value={title} onChange={e => setTitle(e.target.value)} required />
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('lecture.contentLabel')}</label>
                        <RichTextEditor content={content} onChange={setContent} />
                    </div>

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
                        <Button type="submit" loading={loading}>{t('common.save') || 'Save'}</Button>
                        <Button type="button" variant="ghost" onClick={() => router.back()}>{t('common.cancel')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
