'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { useI18n } from '@/components/I18nProvider';

export default function LectureDetailPage() {
    const { t } = useI18n();
    const { id: classId, lid: lectureId } = useParams();
    const router = useRouter();
    const [lecture, setLecture] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/lectures/${lectureId}`)
            .then(res => res.json())
            .then(data => {
                if (data.lecture) setLecture(data.lecture);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [lectureId]);

    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        setLoading(true);
        await fetch(`/api/lectures/${lectureId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText, parentId: replyingTo })
        });
        setCommentText('');
        setReplyingTo(null);
        // Refresh lecture
        const res = await fetch(`/api/lectures/${lectureId}`);
        const data = await res.json();
        if (data.lecture) setLecture(data.lecture);
        setLoading(false);
    };

    if (loading && !lecture) return <div className="text-center py-20 animate-pulse-soft">{t('common.loading')}</div>;
    if (!lecture) return <div className="text-center py-20 opacity-50">{t('api.err.lectureNotFound')}</div>;

    // Organize comments into threads
    const rootComments = lecture.comments.filter((c: any) => !c.parentId);
    const replies = lecture.comments.filter((c: any) => c.parentId);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/classes/${classId}`)}>{t('class.backToClass')}</Button>

            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{lecture.title}</h1>
            <p className="text-sm opacity-60">{t('class.createdAt')} {new Date(lecture.createdAt).toLocaleString()}</p>

            <Card padding="lg" className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {lecture.content}
                </div>
            </Card>

            {lecture.resources && lecture.resources !== '[]' && (
                <div className="pt-6">
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('lecture.sources') || 'Источники и ссылки'}</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(() => {
                            try {
                                const parsed = JSON.parse(lecture.resources);
                                return parsed.map((res: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                        style={{ borderColor: 'var(--border-default)' }}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{res.title}</p>
                                            <p className="text-xs truncate opacity-60">{res.url}</p>
                                        </div>
                                    </a>
                                ));
                            } catch (e) {
                                return null;
                            }
                        })()}
                    </div>
                </div>
            )}

            <div className="pt-8 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('comment.qa')}</h2>

                <Card padding="md" className="mb-6 bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="text-sm font-semibold mb-2">
                        {replyingTo ? t('comment.replyToTitle') : t('comment.askOrLeave')}
                        {replyingTo && (
                            <button onClick={() => setReplyingTo(null)} className="ml-2 text-xs text-red-500 hover:underline">{t('comment.cancelReply')}</button>
                        )}
                    </h3>
                    <TextArea
                        placeholder={t('comment.placeholder')}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                        <Button onClick={handlePostComment} disabled={!commentText.trim() || loading} size="sm">{t('common.send')}</Button>
                    </div>
                </Card>

                <div className="space-y-4">
                    {rootComments.length === 0 ? (
                        <p className="text-sm italic opacity-50">{t('comment.noComments')}</p>
                    ) : (
                        rootComments.map((c: any) => (
                            <div key={c.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                                        {c.author.name[0]}
                                    </div>
                                    <span className="font-semibold text-sm">{c.author.name}</span>
                                    {c.author.role === 'TEACHER' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">{t('role.teacher')}</span>}
                                    <span className="text-xs opacity-50 ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap opacity-90">{c.text}</p>

                                <div className="mt-2 text-right">
                                    <button onClick={() => setReplyingTo(c.id)} className="text-xs text-brand-500 hover:underline font-medium">{t('comment.reply')}</button>
                                </div>

                                {/* Replies */}
                                {replies.filter((r: any) => r.parentId === c.id).length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 space-y-3" style={{ borderColor: 'var(--border-default)' }}>
                                        {replies.filter((r: any) => r.parentId === c.id).map((r: any) => (
                                            <div key={r.id} className="pt-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                        {r.author.name[0]}
                                                    </div>
                                                    <span className="font-medium text-xs">{r.author.name}</span>
                                                    {r.author.role === 'TEACHER' && <span className="text-[9px] px-1 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">{t('role.teacher')}</span>}
                                                    <span className="text-[10px] opacity-50 ml-auto">{new Date(r.createdAt).toLocaleString('ru-RU')}</span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap opacity-80">{r.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
