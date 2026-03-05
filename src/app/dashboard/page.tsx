'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';

const icons = {
    class: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
    lecture: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
    assignment: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" /></svg>,
    students: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
    skills: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
    empty: <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" /></svg>,
    star: <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="Опыт (XP)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
    sword: <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="Уровень"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m11.996 4.757.004-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5v1.493a3 3 0 0 1-1.352 2.518l-3.328 2.08a1.5 1.5 0 0 0-.712 1.282A1.5 1.5 0 0 0 11.108 11.9a3.003 3.003 0 0 0 2.892-.09l3.328-2.08A3 3 0 0 1 18.68 7.252h.07a1.5 1.5 0 0 1 1.5 1.5v.004a3 3 0 0 1-1.352 2.518l-3.328 2.08a1.5 1.5 0 0 0-.712 1.282A1.5 1.5 0 0 0 16.358 15.9a3.003 3.003 0 0 0 2.892-.09l1.664-1.04A3 3 0 0 1 21.001 17.5v2.75a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V17.5a3 3 0 0 1 1.352-2.518l1.664-1.04a3.003 3.003 0 0 0 2.892.09A1.5 1.5 0 0 0 10.408 12.75a1.5 1.5 0 0 0-.712-1.282l-3.328-2.08a3 3 0 0 1-1.352-2.518v-.004c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5l.004 1.5" /></svg>,
    flame: <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="Огонь стриксов (Дни подряд)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg>,
};

interface ClassData {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    _count?: { members: number; assignments: number; lectures: number };
    teacher?: { name: string };
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { t } = useI18n();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const user = session?.user as any;
    const role = user?.role;
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const streakDays = user?.streakDays || 0;

    useEffect(() => {
        if (status === 'unauthenticated') redirect('/login');
        if (status === 'authenticated') {
            fetch('/api/classes')
                .then((r) => r.json())
                .then((data) => {
                    setClasses(data.classes || []);
                    setAchievements(data.achievements || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse-soft text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {t('dash.hello')} {session?.user?.name}!
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {role === 'TEACHER' ? t('dash.teacherSub') : t('dash.studentSub')}
                    </p>
                </div>

                {role === 'TEACHER' ? (
                    <Link href="/classes/new">
                        <Button className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            {t('dash.createClass')}
                        </Button>
                    </Link>
                ) : (
                    <Link href="/join">
                        <Button className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                            {t('dash.joinClass')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Student Gamification Stats */}
            {role === 'STUDENT' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card padding="sm" className="bg-gradient-to-br border-none shadow-sm pb-1" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="flex items-center gap-3 h-full px-2">
                            <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center">
                                {icons.sword}
                            </div>
                            <div>
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('dash.level')} {level}</p>
                                <p className="text-xs opacity-80" style={{ color: 'var(--text-secondary)' }}>{t('dash.novice')}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="sm" className="bg-gradient-to-br border-none shadow-sm" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="flex items-center gap-3 h-full px-2">
                            <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center">
                                {icons.star}
                            </div>
                            <div className="flex-1">
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{xp} XP</p>
                                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mt-2">
                                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(xp % 500) / 500 * 100}%` }}></div>
                                </div>
                                <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{t('dash.toLevel')} {level + 1}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="sm" className="bg-gradient-to-br border-none shadow-sm pb-1" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="flex items-center gap-3 h-full px-2">
                            <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center">
                                {icons.flame}
                            </div>
                            <div>
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{streakDays} {t('dash.days')}</p>
                                <p className="text-xs opacity-80" style={{ color: 'var(--text-secondary)' }}>{t('dash.streak')}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Achievement Badges Display */}
            {role === 'STUDENT' && achievements.length > 0 && (
                <div className="mb-8 p-4 rounded-xl border border-[var(--border-default)]" style={{ background: 'var(--bg-secondary)' }}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" /></svg>{t('dash.achievements')}</h2>
                    <div className="flex flex-wrap gap-3">
                        {achievements.map((ach) => (
                            <div key={ach.id} className="group relative flex items-center justify-center p-3 rounded-full bg-brand-500/10 border border-brand-500/20 w-12 h-12 hover:bg-brand-500/20 transition-all cursor-default">
                                {ach.badgeId === 'first_code' ? '🚀' : '🏆'}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                    {ach.badgeId}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: icons.class, label: t('dash.classes'), value: classes.length },
                    { icon: icons.lecture, label: t('dash.lectures'), value: classes.reduce((s, c) => s + (c._count?.lectures || 0), 0) },
                    { icon: icons.assignment, label: t('dash.assignments'), value: classes.reduce((s, c) => s + (c._count?.assignments || 0), 0) },
                    { icon: role === 'TEACHER' ? icons.students : icons.skills, label: role === 'TEACHER' ? t('dash.students') : t('dash.skills'), value: role === 'TEACHER' ? classes.reduce((s, c) => s + (c._count?.members || 0), 0) : '—' },
                ].map((stat) => (
                    <Card key={stat.label} padding="sm">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-brand-500"
                                style={{ background: 'var(--bg-tertiary)' }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Classes List */}
            <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {role === 'TEACHER' ? t('dash.myClasses') : t('dash.myCourses')}
                </h2>

                {classes.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="text-brand-500 mb-4 opacity-70">
                            {icons.empty}
                        </div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {role === 'TEACHER' ? t('dash.noClasses') : t('dash.noEnrolled')}
                        </p>
                        <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {role === 'TEACHER' ? t('dash.createFirst') : t('dash.askCode')}
                        </p>
                        <Link href={role === 'TEACHER' ? '/classes/new' : '/join'}>
                            <Button size="sm">{role === 'TEACHER' ? t('dash.create') : t('dash.join')}</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                            <Link key={cls.id} href={`/classes/${cls.id}`}>
                                <Card hover padding="md" className="h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                            {cls.name[0]}
                                        </div>
                                        {role === 'TEACHER' && (
                                            <Badge variant="brand" size="sm">
                                                {t('class.code')}: {cls.inviteCode}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle>{cls.name}</CardTitle>
                                    {cls.description && <CardDescription>{cls.description}</CardDescription>}
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <span className="flex items-center gap-1 [&>svg]:w-3.5 [&>svg]:h-3.5"><span className="opacity-60">{icons.lecture}</span> {cls._count?.lectures || 0} {t('dash.lectureCount')}</span>
                                        <span className="flex items-center gap-1 [&>svg]:w-3.5 [&>svg]:h-3.5"><span className="opacity-60">{icons.assignment}</span> {cls._count?.assignments || 0} {t('dash.assignmentCount')}</span>
                                        {role === 'TEACHER' && <span className="flex items-center gap-1 [&>svg]:w-3.5 [&>svg]:h-3.5"><span className="opacity-60">{icons.students}</span> {cls._count?.members || 0} {t('dash.studentCount')}</span>}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
