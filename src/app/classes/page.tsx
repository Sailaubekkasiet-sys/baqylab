'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';

export default function ClassesListPage() {
    const { data: session, status } = useSession();
    const { t } = useI18n();
    const [classes, setClasses] = useState<any[]>([]);
    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (status === 'unauthenticated') redirect('/login');
        if (status === 'authenticated') {
            fetch('/api/classes').then(r => r.json()).then(d => setClasses(d.classes || []));
        }
    }, [status]);

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
                {t('nav.classes')}
            </h1>
            {classes.length === 0 ? (
                <Card className="text-center py-12">
                    <p style={{ color: 'var(--text-secondary)' }}>{t('dash.noClasses')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls: any) => (
                        <Link key={cls.id} href={`/classes/${cls.id}`}>
                            <Card hover padding="md" className="h-full">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">{cls.name[0]}</div>
                                    {role === 'TEACHER' && <Badge variant="brand" size="sm">{t('class.code')}: {cls.inviteCode}</Badge>}
                                </div>
                                <CardTitle>{cls.name}</CardTitle>
                                {cls.description && <CardDescription>{cls.description}</CardDescription>}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
