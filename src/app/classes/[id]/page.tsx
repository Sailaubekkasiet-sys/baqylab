'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';

const icons = {
    lectures: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
    assignments: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" /></svg>,
    students: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
    materials: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>,
    file: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    download: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
    upload: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>,
    clock: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    analytics: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
    check: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
};

interface ClassDetail {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    teacher: { name: string };
    lectures: { id: string; title: string; order: number; createdAt: string }[];
    assignments: {
        id: string; title: string; dueDate: string | null; language: string; type: string;
        _count: { submissions: number; rubricCriteria: number };
        skills: { skill: { name: string; color: string } }[];
        submissions?: { id: string; code?: string; answerText?: string; attachments?: string; studentId: string; student: { name: string } }[];
    }[];
    members: { user: { id: string; name: string; email: string } }[];
    materials: { id: string; fileName: string; fileSize: number; createdAt: string }[];
}

export default function ClassDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const { t } = useI18n();
    const [cls, setCls] = useState<ClassDetail | null>(null);
    const [tab, setTab] = useState<'lectures' | 'assignments' | 'students' | 'materials' | 'analytics' | 'gallery'>('lectures');
    const [loading, setLoading] = useState(true);
    const role = (session?.user as any)?.role;

    useEffect(() => {
        fetch(`/api/classes/${id}`)
            .then((r) => r.json())
            .then((data) => { setCls(data.class); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><p className="animate-pulse-soft" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p></div>;
    }
    if (!cls) {
        return <div className="text-center py-20"><p className="text-4xl mb-3 opacity-50">?</p><p style={{ color: 'var(--text-secondary)' }}>{t('class.notFound')}</p></div>;
    }

    const bestSolutionsCount = cls.assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

    const tabs = [
        { key: 'lectures', label: t('class.tabs.lectures'), icon: icons.lectures, count: cls.lectures.length },
        { key: 'assignments', label: t('class.tabs.assignments'), icon: icons.assignments, count: cls.assignments.length },
        ...(role === 'TEACHER' ? [
            { key: 'students', label: t('class.tabs.students'), icon: icons.students, count: cls.members.length },
            { key: 'analytics', label: t('class.tabs.analytics'), icon: icons.analytics, count: 0 }
        ] : []),
        { key: 'materials', label: t('class.tabs.materials'), icon: icons.materials, count: cls.materials.length },
        { key: 'gallery', label: t('class.tabs.gallery'), icon: icons.check, count: bestSolutionsCount },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{cls.name}</h1>
                        {role === 'TEACHER' && <Badge variant="brand">{t('class.code')}: {cls.inviteCode}</Badge>}
                    </div>
                    {cls.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cls.description}</p>}
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{t('class.teacher')} {cls.teacher.name}</p>
                </div>
                {role === 'TEACHER' && (
                    <div className="flex gap-2">
                        <Link href={`/classes/${id}/lectures/new`}><Button size="sm" className="flex items-center gap-1.5"><span className="w-4 h-4">{icons.lectures}</span>{t('class.lecture')}</Button></Link>
                        <Link href={`/classes/${id}/assignments/new`}><Button size="sm" className="flex items-center gap-1.5"><span className="w-4 h-4">{icons.assignments}</span>{t('class.assignment')}</Button></Link>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'shadow-sm' : ''}`}
                        style={{
                            background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                    >
                        {t.icon}
                        <span>{t.label} {t.count > 0 ? `(${t.count})` : ''}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {tab === 'lectures' && (
                    cls.lectures.length === 0
                        ? <EmptyState text={t('dash.noClasses') ? t('class.noLectures') : t('class.noLectures')} /> // Can refine later
                        : cls.lectures.map((l) => (
                            <Link key={l.id} href={`/classes/${id}/lectures/${l.id}`}>
                                <Card hover padding="md">
                                    <CardTitle className="flex items-center gap-2"><div className="text-brand-500 w-5 h-5">{icons.lectures}</div> {l.title}</CardTitle>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {t('class.createdAt')} {new Date(l.createdAt).toLocaleDateString('ru-RU')}
                                    </p>
                                </Card>
                            </Link>
                        ))
                )}

                {tab === 'assignments' && (
                    cls.assignments.length === 0
                        ? <EmptyState text={t('assign.notfound') ? t('class.noAssignments') : t('class.noAssignments')} />
                        : cls.assignments.map((a) => (
                            <Link key={a.id} href={`/classes/${id}/assignments/${a.id}`}>
                                <Card hover padding="md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{a.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <Badge variant="info" size="sm">{a.language}</Badge>
                                                {a.skills.map((s) => (
                                                    <Badge key={s.skill.name} size="sm" style={{ backgroundColor: s.skill.color + '20', color: s.skill.color }}>
                                                        {s.skill.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {a.dueDate && (
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                    {t('class.dueDate')} {new Date(a.dueDate).toLocaleDateString('ru-RU')}
                                                </p>
                                            )}
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                                {a._count.rubricCriteria} {t('class.criteria')} · {a._count.submissions} {t('class.submissions')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))
                )}

                {tab === 'students' && role === 'TEACHER' && (
                    cls.members.length === 0
                        ? <EmptyState text={t('class.noStudents')} />
                        : cls.members.map((m) => (
                            <Card key={m.user.id} padding="sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {m.user.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.user.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{m.user.email}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                )}

                {tab === 'materials' && (
                    <div>
                        {role === 'TEACHER' && (
                            <MaterialUpload classId={cls.id} onDone={() => window.location.reload()} />
                        )}
                        {cls.materials.length === 0
                            ? <EmptyState text={t('class.noMaterials')} />
                            : cls.materials.map((m) => (
                                <Card key={m.id} padding="sm" className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-brand-500">
                                            {icons.file}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.fileName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                {(m.fileSize / 1024).toFixed(1)} KB · {new Date(m.createdAt).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    </div>
                                    <a href={`/api/materials/${m.id}/download`}>
                                        <Button size="sm" variant="secondary" className="flex items-center gap-1.5">
                                            {icons.download} {t('common.download')}
                                        </Button>
                                    </a>
                                </Card>
                            ))
                        }
                    </div>
                )}

                {tab === 'analytics' && role === 'TEACHER' && (
                    <ClassAnalytics classId={cls.id} />
                )}

                {tab === 'gallery' && (
                    <div className="space-y-6">
                        {bestSolutionsCount === 0 ? (
                            <EmptyState text={t('class.noBestSolutions')} />
                        ) : (
                            cls.assignments.filter(a => a.submissions && a.submissions.length > 0).map(a => (
                                <div key={a.id} className="space-y-4">
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {a.submissions!.map(sub => (
                                            <Card key={sub.id} padding="md" className="border-l-4 border-l-brand-500 flex flex-col h-full">
                                                <div className="flex items-center gap-3 mb-4 shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {sub.student.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {sub.student.name}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('class.bestSolution')}</p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-auto rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900/50 p-3" style={{ border: '1px solid var(--border-default)' }}>
                                                    {a.type === 'CODE' && (
                                                        <pre className="text-xs font-mono whitespace-pre-wrap">{sub.code}</pre>
                                                    )}
                                                    {a.type === 'TEXT' && (
                                                        <div className="whitespace-pre-wrap">{sub.answerText}</div>
                                                    )}
                                                    {a.type === 'QUIZ' && (
                                                        <div className="italic opacity-70">{t('class.quizExcellent')}</div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="text-center py-12">
            <div className="text-brand-500 mb-2 opacity-50 w-10 h-10 mx-auto">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>
        </div>
    );
}

function MaterialUpload({ classId, onDone }: { classId: string; onDone: () => void }) {
    const { t } = useI18n();
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('classId', classId);

        await fetch('/api/materials', { method: 'POST', body: formData });
        setUploading(false);
        onDone();
    };

    return (
        <div className="mb-4">
            <label
                className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer hover:border-brand-500 transition-colors"
                style={{ borderColor: 'var(--border-hover)', background: 'var(--bg-secondary)' }}
            >
                <span className={`w-5 h-5 text-brand-500 ${uploading ? 'animate-spin' : ''}`}>
                    {uploading ? icons.clock : icons.upload}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {uploading ? t('common.loading') : t('class.uploadFile')}
                </span>
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
        </div>
    );
}

function ClassAnalytics({ classId }: { classId: string }) {
    const { t } = useI18n();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/classes/${classId}/analytics`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [classId]);

    if (loading) return <div className="animate-pulse-soft py-10 text-center" style={{ color: 'var(--text-secondary)' }}>{t('analytic.gathering')}</div>;
    if (!data || data.error) return <EmptyState text={data?.error || t('analytic.noDataError')} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <a href={`/api/classes/${classId}/export`} target="_blank" rel="noreferrer">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>{t('analytic.downloadCsv')}</Button>
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="md">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('analytic.avg')}</p>
                    <p className="text-3xl font-bold mt-1 text-brand-500">{data.averageScore?.toFixed(1) || 0}</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('analytic.submitted')}</p>
                    <p className="text-3xl font-bold mt-1 text-green-500">{data.totalSubmissions || 0}</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('analytic.suspicious')}</p>
                    <p className="text-3xl font-bold mt-1 text-red-500">{data.suspiciousCount || 0}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card padding="md">
                    <CardTitle className="mb-4">{t('analytic.risk')}</CardTitle>
                    {data.atRiskStudents && data.atRiskStudents.length > 0 ? (
                        <ul className="space-y-2">
                            {data.atRiskStudents.map((s: any) => (
                                <li key={s.id} className="flex justify-between items-center text-sm">
                                    <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                                    <Badge variant="warning">{t('analytic.stability')}: {s.stability.toFixed(2)}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('analytic.allGood')}</p>
                    )}
                </Card>

                <Card padding="md">
                    <CardTitle className="mb-4">{t('analytic.weak')}</CardTitle>
                    {data.weakSkills && data.weakSkills.length > 0 ? (
                        <ul className="space-y-2">
                            {data.weakSkills.map((s: any) => (
                                <li key={s.name} className="flex flex-col gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{s.score.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full">
                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${s.score}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('analytic.noData')}</p>
                    )}
                </Card>
            </div>

            {/* Student Leaderboard */}
            {data.studentLeaderboard && data.studentLeaderboard.length > 0 && (
                <Card padding="md">
                    <CardTitle className="mb-4">{t('analytic.students')}</CardTitle>
                    <div className="space-y-2">
                        {data.studentLeaderboard.map((s: any, i: number) => (
                            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30" style={{ background: i < 3 ? 'var(--bg-secondary)' : 'transparent' }}>
                                <span className="w-6 text-center text-sm font-bold" style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-tertiary)' }}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {s.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('analytic.level')} {s.level}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant="brand" size="sm">{s.totalXP} {t('analytic.xp')}</Badge>
                                    {s.streakDays > 0 && (
                                        <Badge variant="success" size="sm">{s.streakDays}🔥</Badge>
                                    )}
                                    {s.stability < 0.6 && (
                                        <Badge variant="error" size="sm">⚠</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
