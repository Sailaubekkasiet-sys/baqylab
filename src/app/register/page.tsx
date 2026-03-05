'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/components/I18nProvider';

export default function RegisterPage() {
    const { t } = useI18n();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('auth.err.registration'));
                return;
            }

            // Auto-login after registration
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError(t('auth.err.tryAgain'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
            <Card className="w-full max-w-md animate-slide-up" padding="lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mx-auto mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('auth.registerLink')}</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.createAccountDesc')}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label={t('auth.name')}
                        type="text"
                        placeholder={t('auth.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>}
                    />

                    <Input
                        label={t('auth.password')}
                        type="password"
                        placeholder={t('auth.pwdPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}
                    />

                    {/* Role selector */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('auth.selectRole')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'STUDENT' as const, icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a23.54 23.54 0 0 0-2.688 3.202A23.97 23.97 0 0 1 12 5.25c3.583 0 6.938.793 9.94 2.1a23.54 23.54 0 0 0-2.689-3.203M4.26 10.147A60.46 60.46 0 0 1 12 7.5a60.46 60.46 0 0 1 7.74 2.647" /></svg>, label: t('role.student'), desc: t('auth.studentDesc') },
                                { value: 'TEACHER' as const, icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>, label: t('role.teacher'), desc: t('auth.teacherDesc') },
                            ].map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRole(r.value)}
                                    className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${role === r.value
                                            ? 'border-brand-500 shadow-md scale-[1.02]'
                                            : 'hover:shadow-sm'
                                        }
                  `}
                                    style={{
                                        background: role === r.value ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                        borderColor: role === r.value ? undefined : 'var(--border-default)',
                                    }}
                                >
                                    <div className="text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>{r.icon}</div>
                                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.label}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" loading={loading}>{t('auth.createAccount')}</Button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                    {t('auth.hasAccount')}{' '}
                    <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">{t('auth.loginBtn')}</Link>
                </p>
            </Card>
        </div>
    );
}
