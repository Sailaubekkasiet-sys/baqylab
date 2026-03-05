'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';

export default function GradesPage() {
    const { data: session } = useSession();
    const { t } = useI18n();
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/grades/my')
            .then(r => r.json())
            .then(d => { setGrades(d.submissions || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><p className="animate-pulse-soft" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                {t('nav.grades')}
            </h1>

            {grades.length === 0 ? (
                <Card className="text-center py-12"><p style={{ color: 'var(--text-secondary)' }}>{t('grades.noGradesLong')}</p></Card>
            ) : (
                <div className="space-y-3">
                    {grades.map((s: any) => {
                        const total = s.grades.reduce((sum: number, g: any) => sum + g.points, 0);
                        const max = s.grades.reduce((sum: number, g: any) => sum + g.criterion.maxPoints, 0);
                        const pct = max > 0 ? Math.round((total / max) * 100) : 0;

                        return (
                            <Card key={s.id} padding="md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {s.assignment.title}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                            {s.assignment.class.name} · {t('grades.version')} #{s.version} · {new Date(s.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)',
                                                }}
                                            />
                                        </div>
                                        <Badge variant={pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'}>
                                            {total}/{max}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Criteria breakdown */}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {s.grades.map((g: any) => (
                                        <div key={g.id} className="text-xs p-2 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                            <span className="font-medium">{g.criterion.name}:</span> {g.points}/{g.criterion.maxPoints}
                                            {g.comment && <p className="mt-0.5 opacity-70">{g.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
