'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';

interface SkillProgress {
    name: string;
    color: string;
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    assignmentCount: number;
}

export default function SkillsPage() {
    const { data: session } = useSession();
    const { t } = useI18n();
    const [skills, setSkills] = useState<SkillProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/skills/progress')
            .then(r => r.json())
            .then(d => { setSkills(d.skills || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><p className="animate-pulse-soft" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                {t('nav.skills')}
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('skills.progress_desc')}</p>

            {skills.length === 0 ? (
                <Card className="text-center py-12"><p style={{ color: 'var(--text-secondary)' }}>{t('skills.appear_after')}</p></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map(s => (
                        <Card key={s.name} padding="md">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                                </div>
                                <Badge
                                    variant={s.percentage >= 70 ? 'success' : s.percentage >= 40 ? 'warning' : 'error'}
                                    size="sm"
                                >
                                    {s.percentage}%
                                </Badge>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                                />
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                                {s.totalPoints}/{s.maxPoints} {t('skills.points')} · {s.assignmentCount} {t('skills.assignments')}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
