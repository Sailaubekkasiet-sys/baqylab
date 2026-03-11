'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

export default function ProfileClient({ profile }: { profile: any }) {
    const { t } = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(profile?.user?.name || '');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [nameError, setNameError] = useState('');
    const [currentName, setCurrentName] = useState(profile?.user?.name || '');

    if (!profile?.user) {
        return <div className="text-center py-20"><p style={{ color: 'var(--text-secondary)' }}>Error loading profile</p></div>;
    }

    const { user } = profile;
    const isTeacher = user.role === 'TEACHER';

    const handleSave = async () => {
        if (editName.trim().length < 2) {
            setNameError(t('profile.nameRequired'));
            return;
        }
        setNameError('');
        setSaving(true);
        setSaveStatus('idle');

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim() }),
            });

            if (res.ok) {
                setCurrentName(editName.trim());
                setSaveStatus('saved');
                setIsEditing(false);
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditName(currentName);
        setNameError('');
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border-default)' }}>
                <div className={`absolute inset-0 ${isTeacher
                    ? 'bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20'
                    : 'bg-gradient-to-br from-brand-500/20 via-purple-500/10 to-blue-500/20'
                    }`} />
                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg ${isTeacher
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            : 'bg-gradient-to-br from-brand-500 to-purple-600'
                            }`}>
                            {currentName[0]}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                            {t('profile.editName')}
                                        </label>
                                        <Input
                                            value={editName}
                                            onChange={(e) => { setEditName(e.target.value); setNameError(''); }}
                                            error={nameError}
                                            className="max-w-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                            {saving ? t('profile.saving') : t('profile.save')}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={saving}>
                                            {t('profile.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentName}</h1>
                                        {saveStatus === 'saved' && (
                                            <span className="text-xs font-medium text-green-500 animate-pulse">✓ {t('profile.saved')}</span>
                                        )}
                                    </div>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                                        <Badge variant={isTeacher ? 'success' : 'brand'}>
                                            {isTeacher ? t('role.teacher') : t('role.student')}
                                        </Badge>
                                        {!isTeacher && (
                                            <>
                                                <Badge variant="brand">{t('dash.level')} {user.level}</Badge>
                                                <Badge variant="info">{user.xp} XP</Badge>
                                                {user.streakDays > 0 && <Badge variant="success">{user.streakDays}🔥 {t('dash.streak')}</Badge>}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {!isEditing && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                    {t('profile.editProfile')}
                                </Button>
                            )}
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
                    </div>

                    {/* XP Progress Bar — Students only */}
                    {!isTeacher && (
                        <div className="mt-6">
                            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                                <span>{t('dash.level')} {user.level}</span>
                                <span>{user.xp % 500}/500 XP ({t('profile.remaining')}: {500 - (user.xp % 500)})</span>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-brand-500 to-purple-500"
                                    style={{ width: `${((user.xp % 500) / 500) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===================== TEACHER VIEW ===================== */}
            {isTeacher && profile.teacherStats && (
                <>
                    {/* Teacher Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: t('profile.tClasses'), value: profile.teacherStats.classCount, color: '#6366f1', icon: '📚' },
                            { label: t('profile.tStudents'), value: profile.teacherStats.totalStudents, color: '#3b82f6', icon: '👥' },
                            { label: t('profile.tLectures'), value: profile.teacherStats.totalLectures, color: '#22c55e', icon: '📖' },
                            { label: t('profile.tAssignments'), value: profile.teacherStats.totalAssignments, color: '#f59e0b', icon: '📝' },
                        ].map((s) => (
                            <Card key={s.label} padding="md">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{s.icon}</span>
                                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Graded Works */}
                    <Card padding="lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-lg">✅</div>
                            <div>
                                <CardTitle>{t('profile.tGraded')}</CardTitle>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('profile.tGradedDesc')}</p>
                            </div>
                            <span className="ml-auto text-3xl font-bold" style={{ color: '#8b5cf6' }}>{profile.teacherStats.totalGraded}</span>
                        </div>
                    </Card>

                    {/* Classes Overview */}
                    {profile.teacherStats.classes.length > 0 && (
                        <Card padding="lg">
                            <CardTitle className="mb-4">{t('profile.tClassesOverview')}</CardTitle>
                            <div className="space-y-3">
                                {profile.teacherStats.classes.map((cls: any) => (
                                    <div
                                        key={cls.id}
                                        className="flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01]"
                                        style={{ borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold" style={{ color: 'var(--brand-500)' }}>
                                                {cls.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cls.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                    {cls.studentCount} {t('profile.tStudents').toLowerCase()} · {cls.lectureCount} {t('profile.tLectures').toLowerCase()} · {cls.assignmentCount} {t('profile.tAssignments').toLowerCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* ===================== STUDENT VIEW ===================== */}
            {!isTeacher && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: t('profile.submissions'), value: profile.stats?.submissionCount ?? 0, color: '#3b82f6' },
                            { label: t('profile.graded'), value: profile.stats?.gradedCount ?? 0, color: '#22c55e' },
                            { label: t('profile.avgScore'), value: (profile.stats?.averageScore ?? 0).toFixed(1), color: '#f59e0b' },
                            { label: t('profile.classes'), value: profile.stats?.classCount ?? 0, color: '#8b5cf6' },
                        ].map((s) => (
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
                        <CardTitle className="mb-4">{t('dash.achievements')} ({(profile.achievements || []).length})</CardTitle>
                        {(profile.achievements || []).length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {profile.achievements.map((ach: any) => {
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
                    {profile.userSkills && profile.userSkills.length > 0 && (
                        <Card padding="lg">
                            <CardTitle className="mb-4">{t('nav.skills')}</CardTitle>
                            <div className="space-y-3">
                                {profile.userSkills.map((us: any) => (
                                    <div key={us.skillId} className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ background: us.skill?.color || '#6366f1' }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span style={{ color: 'var(--text-primary)' }}>{us.skill?.name || us.skillId}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{us.mastery}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                                                <div
                                                    className="h-1.5 rounded-full transition-all"
                                                    style={{ width: `${us.mastery}%`, background: us.skill?.color || '#6366f1' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Meta info */}
            <p className="text-xs text-center pb-4" style={{ color: 'var(--text-tertiary)' }}>
                {t('profile.memberSince')} {new Date(user.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}
