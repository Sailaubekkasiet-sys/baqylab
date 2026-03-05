'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/components/I18nProvider';
import { X } from 'lucide-react';

const icons = {
    add: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    trash: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
    check: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
};

interface Criterion {
    name: string;
    description: string;
    maxPoints: number;
    type: 'scale' | 'checkbox' | 'text';
}

interface SelfCheck {
    label: string;
    required: boolean;
}

interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctOptionIdx: number;
}

export default function NewAssignmentPage() {
    const router = useRouter();
    const { id: classId } = useParams();
    const { t } = useI18n();

    const [type, setType] = useState<'CODE' | 'TEXT' | 'QUIZ'>('CODE');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('python');
    const [dueDate, setDueDate] = useState('');
    const [hardDeadline, setHardDeadline] = useState('');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [xpReward, setXpReward] = useState(100);
    const [starterCode, setStarterCode] = useState('');

    // Templates
    const templates: Record<string, { label: string; code: string }> = {
        empty: { label: t('assign.template.empty'), code: '' },
        python: { label: t('assign.template.python'), code: '# -*- coding: utf-8 -*-\n\ndef solution():\n    # Ваш код здесь\n    pass\n\nif __name__ == "__main__":\n    solution()\n' },
        js: { label: t('assign.template.js'), code: '// Ваше решение\n\nfunction solution() {\n  // Ваш код здесь\n}\n\nsolution();\n' },
        html: { label: t('assign.template.html'), code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Solution</title>\n  <style>\n    /* CSS */\n  </style>\n</head>\n<body>\n  <!-- HTML -->\n</body>\n</html>' },
        sql: { label: t('assign.template.sql'), code: '-- SQL Query\nSELECT *\nFROM table_name\nWHERE condition;\n' },
    };

    // TEXT specifics
    const [textPrompt, setTextPrompt] = useState('');

    // QUIZ specifics
    const [quizData, setQuizData] = useState<QuizQuestion[]>([
        { id: '1', text: t('assign.defaultQuestion'), options: [t('assign.optionA'), t('assign.optionB')], correctOptionIdx: 0 }
    ]);

    const [criteria, setCriteria] = useState<Criterion[]>([
        { name: t('assign.defaultCriterion'), description: t('assign.defaultCriterionDesc'), maxPoints: 10, type: 'scale' },
    ]);
    const [selfChecks, setSelfChecks] = useState<SelfCheck[]>([
        { label: t('assign.defaultSelfCheck'), required: true },
    ]);

    const [allSkills, setAllSkills] = useState<{ id: string; name: string; color: string }[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/skills').then(r => r.json()).then(d => setAllSkills(d.skills || []));
    }, []);

    const addCriterion = () => setCriteria([...criteria, { name: '', description: '', maxPoints: 10, type: 'scale' }]);
    const removeCriterion = (i: number) => setCriteria(criteria.filter((_, idx) => idx !== i));
    const updateCriterion = (i: number, field: keyof Criterion, value: any) => {
        const updated = [...criteria];
        (updated[i] as any)[field] = value;
        setCriteria(updated);
    };

    const addSelfCheck = () => setSelfChecks([...selfChecks, { label: '', required: true }]);

    const addQuizQuestion = () => {
        setQuizData([...quizData, { id: Date.now().toString(), text: '', options: ['', ''], correctOptionIdx: 0 }]);
    };
    const removeQuizQuestion = (i: number) => {
        setQuizData(quizData.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    title,
                    description,
                    type,
                    language: type === 'CODE' ? language : 'none',
                    textPrompt: type === 'TEXT' ? textPrompt : '',
                    quizData: type === 'QUIZ' ? JSON.stringify(quizData) : '[]',
                    dueDate: dueDate || null,
                    hardDeadline: hardDeadline || null,
                    difficulty,
                    xpReward,
                    starterCode: type === 'CODE' ? starterCode : '',
                    rubricCriteria: criteria.filter(c => c.name),
                    selfCheckItems: selfChecks.filter(s => s.label),
                    skillIds: selectedSkills,
                }),
            });

            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push(`/classes/${classId}`);
        } catch { setError(t('assign.errCreate')); } finally { setLoading(false); }
    };

    const totalPoints = criteria.reduce((s, c) => s + c.maxPoints, 0);

    return (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t('assign.new')}
            </h1>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Type Selection */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('assign.type')}</h2>
                    <div className="flex gap-2">
                        {['CODE', 'TEXT', 'QUIZ'].map((tType) => (
                            <button
                                key={tType}
                                type="button"
                                onClick={() => setType(tType as any)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${type === tType ? 'border-brand-500 bg-brand-500/10' : 'border-transparent bg-zinc-100 dark:bg-zinc-800/50'}`}
                                style={{ color: type === tType ? 'var(--brand-500)' : 'var(--text-secondary)' }}
                            >
                                {tType === 'CODE' ? t('assign.type.code') : tType === 'TEXT' ? t('assign.type.text') : t('assign.type.quiz')}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Basic Info */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('assign.basic')}</h2>
                    <div className="space-y-4">
                        <Input label={t('assign.title')} placeholder={t('assign.titlePlaceholder')} value={title} onChange={e => setTitle(e.target.value)} required />
                        <TextArea label={t('assign.description')} placeholder={t('assign.descPlaceholder')} value={description} onChange={e => setDescription(e.target.value)} />

                        <div className="grid grid-cols-2 gap-4">
                            {type === 'CODE' && (
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.lang')}</label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="python">Python</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="html">HTML/CSS</option>
                                        <option value="sql">SQL</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.dueDate')}</label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.hardDeadline')}</label>
                                <input
                                    type="datetime-local"
                                    value={hardDeadline}
                                    onChange={e => setHardDeadline(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.difficulty')}</label>
                                <div className="flex gap-2">
                                    {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => {
                                                setDifficulty(d);
                                                setXpReward(d === 'EASY' ? 50 : d === 'MEDIUM' ? 100 : 200);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border-2 ${difficulty === d ? 'scale-105' : ''}`}
                                            style={{
                                                borderColor: difficulty === d
                                                    ? d === 'EASY' ? '#22c55e' : d === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                                                    : 'var(--border-default)',
                                                background: difficulty === d
                                                    ? d === 'EASY' ? '#22c55e15' : d === 'MEDIUM' ? '#f59e0b15' : '#ef444415'
                                                    : 'var(--bg-secondary)',
                                                color: difficulty === d
                                                    ? d === 'EASY' ? '#22c55e' : d === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                                                    : 'var(--text-secondary)',
                                            }}
                                        >
                                            {t(`assign.difficulty.${d.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.xpReward')}</label>
                                <input
                                    type="number"
                                    min={10}
                                    max={1000}
                                    value={xpReward}
                                    onChange={e => setXpReward(parseInt(e.target.value) || 100)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
                                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Type Specific Form */}
                {type === 'CODE' && (
                    <Card padding="lg">
                        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('assign.template')}</h2>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(templates).map(([key, tmpl]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setStarterCode(tmpl.code)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${starterCode === tmpl.code ? 'border-brand-500 bg-brand-500/10' : 'border-transparent bg-zinc-100 dark:bg-zinc-800/50'}`}
                                    style={{ color: starterCode === tmpl.code ? 'var(--brand-500)' : 'var(--text-secondary)' }}
                                >
                                    {tmpl.label}
                                </button>
                            ))}
                        </div>
                        {starterCode && (
                            <pre className="mt-3 p-3 rounded-lg text-xs font-mono overflow-x-auto" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                {starterCode}
                            </pre>
                        )}
                    </Card>
                )}

                {type === 'TEXT' && (
                    <Card padding="lg">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('assign.type.text')}</h2>
                        <TextArea
                            label={t('assign.textPrompt')}
                            placeholder={t('assign.textPlaceholder')}
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                        />
                    </Card>
                )}

                {type === 'QUIZ' && (
                    <Card padding="lg">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('assign.quizBuilder')}</h2>
                        <div className="space-y-6">
                            {quizData.map((q, qIndex) => (
                                <div key={q.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-default)' }}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-medium">{t('assign.question')} {qIndex + 1}</span>
                                        <button type="button" onClick={() => removeQuizQuestion(qIndex)} className="text-red-500 hover:opacity-70 p-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <Input
                                        placeholder={t('quiz.questionText')}
                                        value={q.text}
                                        onChange={(e) => {
                                            const u = [...quizData]; u[qIndex].text = e.target.value; setQuizData(u);
                                        }}
                                    />
                                    <div className="mt-3 space-y-2">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctOptionIdx === optIndex}
                                                    onChange={() => {
                                                        const u = [...quizData]; u[qIndex].correctOptionIdx = optIndex; setQuizData(u);
                                                    }}
                                                />
                                                <Input
                                                    placeholder={`${t('assign.option')} ${optIndex + 1}`}
                                                    value={opt}
                                                    className="flex-1"
                                                    onChange={(e) => {
                                                        const u = [...quizData]; u[qIndex].options[optIndex] = e.target.value; setQuizData(u);
                                                    }}
                                                />
                                                <button type="button" onClick={() => {
                                                    const u = [...quizData]; u[qIndex].options.splice(optIndex, 1);
                                                    if (u[qIndex].correctOptionIdx >= u[qIndex].options.length) u[qIndex].correctOptionIdx = 0;
                                                    setQuizData(u);
                                                }} className="text-red-500 p-1">
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => {
                                        const u = [...quizData]; u[qIndex].options.push(''); setQuizData(u);
                                    }}>{t('assign.addOption')}</Button>
                                </div>
                            ))}
                            <Button type="button" variant="ghost" onClick={addQuizQuestion} className="w-full flex justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700">
                                {icons.add} {t('assign.addQuestion')}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Skills Component (omitted inner mapping for brevity, similar to before but without emojis) */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>{t('nav.skills')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {allSkills.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSelectedSkills(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedSkills.includes(s.id) ? 'border-brand-500 scale-105' : ''}`}
                                style={{
                                    borderColor: selectedSkills.includes(s.id) ? s.color : 'var(--border-default)',
                                    backgroundColor: selectedSkills.includes(s.id) ? s.color + '20' : 'var(--bg-secondary)',
                                    color: selectedSkills.includes(s.id) ? s.color : 'var(--text-secondary)',
                                }}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Rubric Constructor */}
                <Card padding="lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('assign.rubricBuilder')}</h2>
                        <Badge variant="brand">{t('assign.totalPoints')}: {totalPoints} {t('assign.points').toLowerCase()}</Badge>
                    </div>

                    <div className="space-y-3">
                        {criteria.map((c, i) => (
                            <div key={i} className="rounded-lg border p-4 animate-slide-up" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <Input placeholder={t('assign.criterionName')} value={c.name} onChange={e => updateCriterion(i, 'name', e.target.value)} />
                                            </div>
                                            <Input type="number" placeholder={t('assign.points')} value={c.maxPoints} onChange={e => updateCriterion(i, 'maxPoints', parseInt(e.target.value) || 0)} />
                                        </div>
                                        <Input placeholder={t('assign.criterionDesc')} value={c.description} onChange={e => updateCriterion(i, 'description', e.target.value)} />
                                        <div className="flex gap-2">
                                            {(['scale', 'checkbox', 'text'] as const).map(tOpt => (
                                                <button
                                                    key={tOpt}
                                                    type="button"
                                                    onClick={() => updateCriterion(i, 'type', tOpt)}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all`}
                                                    style={{
                                                        background: c.type === tOpt ? 'var(--brand-500)' : 'var(--bg-tertiary)',
                                                        color: c.type === tOpt ? 'white' : 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {tOpt === 'scale' ? t('assign.scale') : tOpt === 'checkbox' ? t('assign.checkbox') : t('assign.text')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeCriterion(i)} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button type="button" variant="secondary" size="sm" className="mt-3 flex items-center gap-2" onClick={addCriterion}>
                        {icons.add} {t('assign.addCriterion')}
                    </Button>
                </Card>

                {/* Self-Check */}
                <Card padding="lg">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {icons.check} {t('assign.selfCheck')}
                    </h2>
                    <div className="space-y-2">
                        {selfChecks.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    placeholder={t('assign.selfCheckItem')}
                                    value={s.label}
                                    onChange={e => { const u = [...selfChecks]; u[i].label = e.target.value; setSelfChecks(u); }}
                                    className="flex-1"
                                />
                                <button type="button" onClick={() => setSelfChecks(selfChecks.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="mt-3 flex items-center gap-2" onClick={addSelfCheck}>
                        {icons.add} {t('assign.addSelfCheck')}
                    </Button>
                </Card>

                {/* Submit */}
                <div className="flex gap-3">
                    <Button type="submit" loading={loading} className="flex-1">
                        {t('assign.create')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.back()}>{t('assign.cancel')}</Button>
                </div>
            </form>
        </div>
    );
}
