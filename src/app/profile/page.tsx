'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/I18nProvider';

const BADGE_MAP: Record<string, { emoji: string; color: string }> = {
    first_code: { emoji: '🚀', color: '#3b82f6' },
    streak_3: { emoji: '🔥', color: '#f97316' },
    streak_5: { emoji: '🔥', color: '#ef4444' },
    streak_7: { emoji: '💎', color: '#8b5cf6' },
    level_5: { emoji: '⭐', color: '#f59e0b' },
    level_10: { emoji: '🌟', color: '#eab308' },
    perfect_score: { emoji: '💯', color: '#22c55e' },
    first_review: { emoji: '👀', color: '#06b6d4' },
    ten_submissions: { emoji: '📝', color: '#6366f1' },
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { t } = useI18n();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') redirect('/login');
        if (status === 'authenticated') {
            fetch('/api/profile')
                .then(r => r.json())
                .then(d => { setProfile(d); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="animate-pulse-soft" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
            </div>
        );
    }

    if (!profile?.user) {
        return <div className="text-center py-20"><p style={{ color: 'var(--text-secondary)' }}>Error loading profile</p></div>;
    }

    const { user, achievements, userSkills, stats } = profile;
    const xpInLevel = user.xp % 500;
    const xpToNext = 500 - xpInLevel;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border-default)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-purple-500/10 to-blue-500/20" />
                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {user.name[0]}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                                <Badge variant="brand">{t('dash.level')} {user.level}</Badge>
                                <Badge variant="info">{user.xp} XP</Badge>
                                {user.streakDays > 0 && <Badge variant="success">{user.streakDays}🔥 {t('dash.streak')}</Badge>}
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                                const res = await fetch('/api/profile/report');
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                            }}
                        >
                            📄 {t('profile.downloadPDF')}
                        </Button>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                            <span>{t('dash.level')} {user.level}</span>
                            <span>{xpInLevel}/500 XP ({t('profile.remaining')}: {xpToNext})</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-brand-500 to-purple-500"
                                style={{ width: `${(xpInLevel / 500) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: t('profile.submissions'), value: stats.submissionCount, color: '#3b82f6' },
                    { label: t('profile.graded'), value: stats.gradedCount, color: '#22c55e' },
                    { label: t('profile.avgScore'), value: stats.averageScore.toFixed(1), color: '#f59e0b' },
                    { label: t('profile.classes'), value: stats.classCount, color: '#8b5cf6' },
                ].map(s => (
                    <Card key={s.label} padding="md">
                        <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Academic Stability */}
            <Card padding="lg">
                <CardTitle className="mb-3">{t('profile.stability')}</CardTitle>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${(user.academicStability || 1) * 100}%`,
                                    background: (user.academicStability || 1) >= 0.7 ? '#22c55e' : (user.academicStability || 1) >= 0.4 ? '#f59e0b' : '#ef4444',
                                }}
                            />
                        </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: (user.academicStability || 1) >= 0.7 ? '#22c55e' : (user.academicStability || 1) >= 0.4 ? '#f59e0b' : '#ef4444' }}>
                        {((user.academicStability || 1) * 100).toFixed(0)}%
                    </span>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>{t('profile.stabilityDesc')}</p>
            </Card>

            {/* Achievements */}
            <Card padding="lg">
                <CardTitle className="mb-4">{t('dash.achievements')} ({achievements.length})</CardTitle>
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {achievements.map((ach: any) => {
                            const badge = BADGE_MAP[ach.badgeId] || { emoji: '🏆', color: '#6366f1' };
                            return (
                                <div
                                    key={ach.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02]"
                                    style={{ borderColor: badge.color + '30', background: badge.color + '08' }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                        style={{ background: badge.color + '20' }}
                                    >
                                        {badge.emoji}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ach.badgeId}</p>
                                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                            {new Date(ach.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>{t('profile.noBadges')}</p>
                )}
            </Card>

            {/* Skill Mastery */}
            {userSkills && userSkills.length > 0 && (
                <Card padding="lg">
                    <CardTitle className="mb-4">{t('nav.skills')}</CardTitle>
                    <div className="space-y-3">
                        {userSkills.map((us: any) => (
                            <div key={us.skillId} className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ background: us.skill?.color || '#6366f1' }}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span style={{ color: 'var(--text-primary)' }}>{us.skill?.name || us.skillId}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{us.masteryLevel}%</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{ width: `${us.masteryLevel}%`, background: us.skill?.color || '#6366f1' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Meta info */}
            <p className="text-xs text-center pb-4" style={{ color: 'var(--text-tertiary)' }}>
                {t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}
