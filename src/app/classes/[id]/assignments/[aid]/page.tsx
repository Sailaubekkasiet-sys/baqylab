'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TextArea, Input } from '@/components/ui/Input';
import { useI18n } from '@/components/I18nProvider';
import { X } from 'lucide-react';

const icons = {
    info: <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    success: <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

import { usePython } from '@/hooks/usePython';
import { runJavaScript } from '@/hooks/useJavaScript';
import { runClientSideAutoGrade } from '@/utils/clientAutograde';

export default function AssignmentDetailPage() {
    const { id: classId, aid } = useParams();
    const { data: session } = useSession();
    const { t } = useI18n();
    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    const [assignment, setAssignment] = useState<any>(null);
    const [checkedItems, setCheckedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tab, setTab] = useState<'task' | 'submit' | 'versions' | 'review' | 'peer'>('task');

    // Submission states
    const [code, setCode] = useState('');
    const [answerText, setAnswerText] = useState('');
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const [attachments, setAttachments] = useState<string>(''); // Simplified JSON string or URL array
    const [uploadingAttachment, setUploadingAttachment] = useState(false);

    // Grading state (teacher)
    const [gradingSubmission, setGradingSubmission] = useState<any>(null);
    const [criterionGrades, setCriterionGrades] = useState<{ criterionId: string; points: number; comment: string }[]>([]);
    const [newLineComments, setNewLineComments] = useState<{ lineNumber: number; text: string; type: string }[]>([]);
    const [gradingLoading, setGrading] = useState(false);
    const [isBestSolution, setIsBestSolution] = useState(false);

    // Peer review state (student)
    const [peerReviews, setPeerReviews] = useState<any[]>([]);
    const [peerRating, setPeerRating] = useState(5);
    const [peerComment, setPeerComment] = useState('');
    const [peerSubmitting, setPeerSubmitting] = useState(false);
    const [peerTarget, setPeerTarget] = useState<string | null>(null);

    const [compareVersions, setCompareVersions] = useState<[number, number] | null>(null);
    const handleSubmitRef = useRef<(() => void) | null>(null);

    // Intercept client hooks
    const { run: runPython, isLoaded: isPythonLoaded, isLoading: isPythonLoading } = usePython();

    useEffect(() => {
        fetch(`/api/assignments/${aid}`)
            .then(r => r.json())
            .then(d => { setAssignment(d.assignment); setLoading(false); })
            .catch(() => setLoading(false));
    }, [aid]);



    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><p className="animate-pulse-soft" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p></div>;
    if (!assignment) return <div className="text-center py-20"><p style={{ color: 'var(--text-secondary)' }}>{t('api.err.assignNotFound')}</p></div>;

    const mySubmissions = assignment.submissions.filter((s: any) => s.studentId === userId).sort((a: any, b: any) => b.version - a.version);
    const allStudentSubmissions = role === 'TEACHER' ? assignment.submissions : [];
    const requiredChecks = assignment.selfCheckItems.filter((s: any) => s.required);
    const allChecked = requiredChecks.every((s: any) => checkedItems.includes(s.id));
    const totalMaxPoints = assignment.rubricCriteria.reduce((s: number, c: any) => s + c.maxPoints, 0);

    const type = assignment.type || 'CODE';
    let parsedQuizData: any[] = [];
    if (type === 'QUIZ' && assignment.quizData) {
        try { parsedQuizData = JSON.parse(assignment.quizData); } catch { }
    }

    const isSubmitReady = () => {
        if (requiredChecks.length > 0 && !allChecked) return false;
        if (type === 'CODE' && !code) return false;
        if (type === 'CODE' && assignment.language === 'python' && !isPythonLoaded) return false; // Must wait for Pyodide
        if (type === 'TEXT' && !answerText) return false;
        if (type === 'QUIZ' && Object.keys(quizAnswers).length < parsedQuizData.length) return false;
        return true;
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        let autoResults = null;
        if (type === 'CODE' && code && assignment.testCases && assignment.testCases !== '[]') {
            try {
                const testCases = JSON.parse(assignment.testCases);
                if (testCases.length > 0) {
                    autoResults = await runClientSideAutoGrade(code, assignment.language, testCases, runPython, runJavaScript);
                }
            } catch (error) {
                console.error('Client-side autograding failed:', error);
            }
        }

        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assignmentId: aid,
                code: type === 'CODE' ? code : undefined,
                answerText: type === 'TEXT' ? answerText : undefined,
                quizAnswers: type === 'QUIZ' ? JSON.stringify(quizAnswers) : undefined,
                attachments,
                selfChecks: checkedItems,
                autoResults,
            }),
        });
        const data = await res.json();
        setSubmitting(false);

        // Show auto-grade results if available
        if (data.autoResults || autoResults) {
            const resultsToUse = data.autoResults ? (typeof data.autoResults === 'string' ? JSON.parse(data.autoResults) : data.autoResults) : autoResults;
            const { passed, total } = resultsToUse;
            alert(`${t('autograde.result')}: ${passed}/${total} ${t('autograde.passed')}`);
        }
        window.location.reload();
    };

    const handleGrade = async () => {
        if (!gradingSubmission) return;
        setGrading(true);
        await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: gradingSubmission.id, criterionGrades, lineComments: newLineComments, isBestSolution }),
        });
        setGrading(false);
        window.location.reload();
    };

    // Update ref for auto-submit
    handleSubmitRef.current = handleSubmit;

    const tabs = role === 'TEACHER'
        ? [
            { key: 'task', label: t('assign.info') },
            { key: 'review', label: `${t('assign.review')} (${allStudentSubmissions.length})` },
        ]
        : [
            { key: 'task', label: t('assign.info') },
            { key: 'submit', label: t('assign.solution') },
            { key: 'versions', label: `${t('assign.versions')} (${mySubmissions.length})` },
            { key: 'peer', label: t('peer.title') },
        ];

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{assignment.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="default">{type === 'CODE' ? t('assign.type.code') : type === 'TEXT' ? t('assign.type.text') : t('assign.type.quiz')}</Badge>
                    {type === 'CODE' && <Badge variant="info">{assignment.language}</Badge>}
                    {assignment.skills.map((s: any) => (
                        <Badge key={s.skill.name} size="sm" style={{ backgroundColor: s.skill.color + '20', color: s.skill.color }}>{s.skill.name}</Badge>
                    ))}
                    {assignment.dueDate && <Badge variant="warning">{t('assign.deadline')}: {new Date(assignment.dueDate).toLocaleDateString()}</Badge>}
                    <Badge variant="brand">{totalMaxPoints} {t('assign.pointsUnit')}</Badge>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
                {tabs.map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key as any)}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${tab === tb.key ? 'shadow-sm' : ''}`}
                        style={{ background: tab === tb.key ? 'var(--bg-card)' : 'transparent', color: tab === tb.key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {tb.label}
                    </button>
                ))}
            </div>

            {/* Task Tab */}
            {tab === 'task' && (
                <div className="space-y-4">
                    <Card padding="lg">
                        <h2 className="font-semibold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>{t('assign.description')}</h2>
                        <div className="prose max-w-none text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {assignment.description || t('assign.no_desc')}
                        </div>
                    </Card>

                    {type === 'TEXT' && assignment.textPrompt && (
                        <Card padding="lg" className="bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
                            <h2 className="font-semibold mb-2 flex items-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>{t('bot.questionTopic')}</h2>
                            <p className="text-sm font-semibold">{assignment.textPrompt}</p>
                        </Card>
                    )}

                    {type === 'QUIZ' && parsedQuizData.length > 0 && (
                        <Card padding="lg">
                            <h2 className="font-semibold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>{t('assign.quizFormat')}</h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('assign.questionsCount')} {parsedQuizData.length}</p>
                        </Card>
                    )}

                    {/* Rubric Preview */}
                    <Card padding="lg">
                        <h2 className="font-semibold mb-3 flex items-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>{t('assign.criteria')}</h2>
                        <div className="space-y-2">
                            {assignment.rubricCriteria.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                                        {c.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{c.description}</p>}
                                    </div>
                                    <Badge variant="brand">{c.maxPoints} {t('assign.pointsShort')}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Submit Tab (Student) */}
            {tab === 'submit' && role === 'STUDENT' && (
                <div className="space-y-4">
                    <Card padding="lg">
                        <h2 className="font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>{t('assign.yourSolution')}</h2>

                        {type === 'CODE' && (
                            <div className="relative">
                                <textarea
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    placeholder={`# ${t('assign.writeCode')} ${assignment.language} ${t('assign.here')}`}
                                    className="w-full h-64 font-mono text-sm rounded-lg border p-4 resize-y outline-none focus:ring-2 focus:ring-brand-500/30"
                                    style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        )}

                        {type === 'TEXT' && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10">
                                    <p className="text-sm font-medium">{assignment.textPrompt}</p>
                                </div>
                                <TextArea
                                    placeholder={t('assign.detailedAnswer')}
                                    className="min-h-[200px]"
                                    value={answerText}
                                    onChange={e => setAnswerText(e.target.value)}
                                />
                            </div>
                        )}

                        {type === 'QUIZ' && (
                            <div className="space-y-6">
                                {parsedQuizData.map((q: any, qIndex: number) => (
                                    <div key={q.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-default)' }}>
                                        <p className="font-medium mb-3">{qIndex + 1}. {q.text}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt: string, optIndex: number) => (
                                                <label key={optIndex} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={`quiz-${q.id}`}
                                                        checked={quizAnswers[q.id] === optIndex}
                                                        onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIndex })}
                                                        className="w-4 h-4 accent-brand-500"
                                                    />
                                                    <span className="text-sm">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border-default)' }}>
                            <h3 className="text-sm font-medium mb-2">{t('assign.attachFileOpt')}</h3>
                            <Input placeholder={t('assign.linkExample')} value={attachments} onChange={e => setAttachments(e.target.value)} />

                            <label className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer hover:border-brand-500 transition-colors" style={{ borderColor: 'var(--border-hover)', background: 'var(--bg-secondary)' }}>
                                <span className={`w-5 h-5 text-brand-500 ${uploadingAttachment ? 'animate-spin' : ''}`} aria-hidden="true">
                                    {uploadingAttachment ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                                    )}
                                </span>
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    {uploadingAttachment ? t('common.loading') : t('class.uploadFile')}
                                </span>
                                <input type="file" className="hidden" disabled={uploadingAttachment} onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadingAttachment(true);
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('assignmentId', aid as string);
                                    try {
                                        const r = await fetch('/api/submissions/upload', { method: 'POST', body: formData });
                                        const d = await r.json();
                                        if (d.url) setAttachments(prev => prev ? prev + ', ' + d.url : d.url);
                                    } finally { setUploadingAttachment(false); }
                                }} />
                            </label>
                        </div>
                    </Card>

                    {/* Self-check */}
                    {assignment.selfCheckItems.length > 0 && (
                        <Card padding="lg">
                            <h2 className="font-semibold mb-3 flex items-center gap-2 text-lg" style={{ color: 'var(--text-primary)' }}>
                                {icons.success} {t('assign.selfCheckTitle')}
                            </h2>
                            <div className="space-y-2">
                                {assignment.selfCheckItems.map((s: any) => (
                                    <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors"
                                        style={{ background: checkedItems.includes(s.id) ? 'var(--bg-tertiary)' : 'transparent' }}>
                                        <input
                                            type="checkbox"
                                            checked={checkedItems.includes(s.id)}
                                            onChange={e => setCheckedItems(e.target.checked ? [...checkedItems, s.id] : checkedItems.filter(id => id !== s.id))}
                                            className="w-4 h-4 rounded accent-brand-500"
                                        />
                                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</span>
                                        {s.required && <Badge variant="warning" size="sm">{t('assign.required')}</Badge>}
                                    </label>
                                ))}
                            </div>
                            {!allChecked && <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">{icons.warning} {t('assign.selfCheckWarning')}</p>}
                        </Card>
                    )}

                    <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('grades.version')} #{mySubmissions.length + 1}</p>
                        <Button onClick={handleSubmit} loading={submitting} disabled={!isSubmitReady()}>{t('assign.submitSolution')}</Button>
                    </div>
                </div>
            )}

            {/* Versions Tab (Student) */}
            {tab === 'versions' && (
                <div className="space-y-4">
                    {mySubmissions.length === 0 ? (
                        <Card className="text-center py-12"><p style={{ color: 'var(--text-secondary)' }}>{t('assign.notSubmittedYet')}</p></Card>
                    ) : (
                        mySubmissions.map((s: any) => (
                            <Card key={s.id} padding="md">
                                <div className="flex items-start justify-between mb-3 border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                                    <div>
                                        <CardTitle>{t('grades.version')} #{s.version}</CardTitle>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                            {new Date(s.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant={s.status === 'graded' ? 'success' : s.status === 'submitted' ? 'info' : 'default'}>
                                        {s.status === 'graded' ? t('review.graded') : s.status === 'submitted' ? t('review.submitted') : t('review.draft')}
                                    </Badge>
                                </div>

                                <div className="mt-3">
                                    <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>{t('assign.solutionLabel')}</h3>
                                    {type === 'CODE' && <pre className="code-block text-xs overflow-x-auto max-h-60">{s.code || t('assign.noCode')}</pre>}
                                    {type === 'TEXT' && <div className="p-3 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900/50 whitespace-pre-wrap">{s.answerText || t('assign.noAnswer')}</div>}
                                    {type === 'QUIZ' && (
                                        <div className="text-sm space-y-1">
                                            {Object.entries(JSON.parse(s.quizAnswers || '{}')).map(([qId, ansIdx]: any) => {
                                                const q = parsedQuizData.find((qd: any) => qd.id === qId);
                                                return (
                                                    <div key={qId} className="p-2 border rounded bg-zinc-50 dark:bg-zinc-900/50">
                                                        <p className="font-medium text-xs mb-1">{q?.text || qId}</p>
                                                        <p className="text-zinc-600 dark:text-zinc-400">{t('assign.answer')}: {q ? q.options[ansIdx] : ansIdx}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {s.attachments && (
                                    <div className="mt-3">
                                        <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('assign.attachments')}</h3>
                                        <a href={s.attachments} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline break-all">{s.attachments}</a>
                                    </div>
                                )}

                                {/* Auto-grade Results */}
                                {s.autoResults && (() => {
                                    try {
                                        const ar = JSON.parse(s.autoResults);
                                        return (
                                            <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: ar.passed === ar.total ? '#22c55e40' : '#ef444440', background: ar.passed === ar.total ? '#22c55e08' : '#ef444408' }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{t('autograde.title')}</h3>
                                                    <Badge variant={ar.passed === ar.total ? 'success' : 'error'}>
                                                        {ar.passed}/{ar.total} {t('autograde.passed')}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    {ar.results.map((r: any, i: number) => (
                                                        <div key={i} className="flex items-start gap-2 text-xs p-1.5 rounded" style={{ background: r.passed ? '#22c55e10' : '#ef444410' }}>
                                                            <span className="shrink-0">{r.passed ? '✅' : '❌'}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <span style={{ color: 'var(--text-secondary)' }}>{t('autograde.input')}: </span>
                                                                <code className="text-[10px]">{r.input.substring(0, 50)}</code>
                                                                {!r.passed && (
                                                                    <div className="mt-0.5">
                                                                        <span className="text-red-500">{t('autograde.expected')}: {r.expected.substring(0, 50)}</span>
                                                                        <br />
                                                                        <span className="text-orange-500">{t('autograde.actual')}: {r.actual.substring(0, 50)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } catch { return null; }
                                })()}



                                {/* Grades & Comments (Omitted details for brevity, largely unchanged except no emojis) */}
                                {s.grades?.length > 0 && (
                                    <div className="mt-4 space-y-2 p-3 bg-brand-50/50 dark:bg-brand-900/10 rounded-lg border border-brand-200 dark:border-brand-800">
                                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('assign.gradesByCriteria')}:</h3>
                                        {s.grades.map((g: any) => (
                                            <div key={g.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{g.criterion.name}</span>
                                                <Badge variant={g.points >= g.criterion.maxPoints * 0.7 ? 'success' : g.points >= g.criterion.maxPoints * 0.4 ? 'warning' : 'error'}>
                                                    {g.points} / {g.criterion.maxPoints}
                                                </Badge>
                                            </div>
                                        ))}
                                        <div className="flex justify-end mt-2 pt-2 border-t border-brand-200 dark:border-brand-800">
                                            <Badge variant="brand" size="md">
                                                {t('assign.total')}: {s.grades.reduce((s2: number, g: any) => s2 + g.points, 0)} / {totalMaxPoints}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}

                    {/* Diff Viewer — compare versions */}
                    {type === 'CODE' && mySubmissions.length >= 2 && (
                        <Card padding="md">
                            <div className="flex items-center justify-between mb-3">
                                <CardTitle>{t('diff.title')}</CardTitle>
                                {compareVersions ? (
                                    <Button variant="ghost" size="sm" onClick={() => setCompareVersions(null)}>{t('assign.cancel')}</Button>
                                ) : (
                                    <Button size="sm" onClick={() => setCompareVersions([mySubmissions[0].version, mySubmissions[1].version])}>
                                        {t('diff.compare')} v{mySubmissions[0].version} ↔ v{mySubmissions[1].version}
                                    </Button>
                                )}
                            </div>
                            {compareVersions && (() => {
                                const [v1, v2] = compareVersions;
                                const sub1 = mySubmissions.find((s: any) => s.version === v1);
                                const sub2 = mySubmissions.find((s: any) => s.version === v2);
                                if (!sub1 || !sub2) return null;

                                const lines1 = (sub2.code || '').split('\n');
                                const lines2 = (sub1.code || '').split('\n');
                                const maxLen = Math.max(lines1.length, lines2.length);

                                return (
                                    <div className="overflow-x-auto rounded-lg border text-xs font-mono" style={{ borderColor: 'var(--border-default)' }}>
                                        <div className="flex gap-0.5 p-1 mb-1" style={{ background: 'var(--bg-secondary)' }}>
                                            <Badge variant="error" size="sm">v{v2} ({t('diff.old')})</Badge>
                                            <Badge variant="success" size="sm">v{v1} ({t('diff.new')})</Badge>
                                        </div>
                                        {Array.from({ length: maxLen }).map((_, i) => {
                                            const old = lines1[i] ?? '';
                                            const cur = lines2[i] ?? '';
                                            const added = i >= lines1.length;
                                            const removed = i >= lines2.length;
                                            const changed = !added && !removed && old !== cur;

                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-1 px-2 py-0.5"
                                                    style={{
                                                        background: added ? '#22c55e15' : removed ? '#ef444415' : changed ? '#f59e0b10' : 'transparent',
                                                    }}
                                                >
                                                    <span className="w-6 text-right shrink-0 select-none" style={{ color: 'var(--text-tertiary)' }}>{i + 1}</span>
                                                    <span className="w-4 shrink-0 select-none font-bold" style={{ color: added ? '#22c55e' : removed ? '#ef4444' : changed ? '#f59e0b' : 'transparent' }}>
                                                        {added ? '+' : removed ? '-' : changed ? '~' : ' '}
                                                    </span>
                                                    <span style={{ color: removed ? '#ef4444' : changed ? '#f59e0b' : 'var(--text-primary)' }} className="break-all whitespace-pre-wrap">
                                                        {removed ? old : cur}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </Card>
                    )}
                </div>
            )}

            {/* Review Tab (Teacher) */}
            {tab === 'review' && role === 'TEACHER' && (
                <div className="space-y-4">
                    {allStudentSubmissions.length === 0 ? (
                        <Card className="text-center py-12"><p style={{ color: 'var(--text-secondary)' }}>{t('review.noWorks')}</p></Card>
                    ) : (
                        <>
                            {!gradingSubmission && (
                                <div className="space-y-3">
                                    {Object.values(
                                        allStudentSubmissions.reduce((acc: any, s: any) => {
                                            if (!acc[s.studentId] || s.version > acc[s.studentId].version) acc[s.studentId] = s;
                                            return acc;
                                        }, {})
                                    ).map((s: any) => (
                                        <Card key={s.id} hover padding="md" className="cursor-pointer" onClick={() => {
                                            setGradingSubmission(s);
                                            setIsBestSolution(s.isBestSolution || false);
                                            setCriterionGrades(assignment.rubricCriteria.map((c: any) => {
                                                const existing = s.grades.find((g: any) => g.criterionId === c.id);
                                                return { criterionId: c.id, points: existing?.points ?? c.maxPoints, comment: existing?.comment || '' };
                                            }));
                                        }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {s.student.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {s.student.name}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('grades.version')} #{s.version} · {new Date(s.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={s.status === 'graded' ? 'success' : 'info'}>
                                                    {s.status === 'graded' ? t('review.graded') : t('review.pendingStatus')}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}


                                </div>
                            )}

                            {/* Grading Panel */}
                            {gradingSubmission && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                                {gradingSubmission.student.name} (v{gradingSubmission.version})
                                            </h2>
                                            <Button variant="ghost" size="sm" onClick={() => setGradingSubmission(null)}>{t('assign.back')}</Button>
                                        </div>

                                        <Card padding="md">
                                            <h3 className="text-sm font-semibold mb-3 border-b pb-2" style={{ borderColor: 'var(--border-default)' }}>{t('assign.solution')}</h3>

                                            {type === 'CODE' && (
                                                <div className="code-block relative">
                                                    {(gradingSubmission.code || '').split('\n').map((line: string, i: number) => (
                                                        <div key={i} className="flex group hover:bg-brand-500/5 rounded transition-colors">
                                                            <button
                                                                onClick={() => {
                                                                    const text = prompt(`${t('assign.commentLine')} ${i + 1}:`);
                                                                    if (text) setNewLineComments([...newLineComments, { lineNumber: i + 1, text, type: 'tip' }]);
                                                                }}
                                                                className="w-8 text-right pr-2 select-none text-xs shrink-0 opacity-40 hover:opacity-100 hover:text-brand-500 cursor-pointer"
                                                            >
                                                                {i + 1}
                                                            </button>
                                                            <span className="pl-2">{line || '\u00A0'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {type === 'TEXT' && (
                                                <div className="p-3 border rounded bg-zinc-50 dark:bg-zinc-900/50 whitespace-pre-wrap text-sm">
                                                    {gradingSubmission.answerText || t('assign.noAnswer')}
                                                </div>
                                            )}

                                            {type === 'QUIZ' && (
                                                <div className="space-y-2">
                                                    {Object.entries(JSON.parse(gradingSubmission.quizAnswers || '{}')).map(([qId, ansIdx]: any) => {
                                                        const q = parsedQuizData.find((qd: any) => qd.id === qId);
                                                        const isCorrect = q && ansIdx === q.correctOptionIdx;
                                                        return (
                                                            <div key={qId} className={`p-2 border rounded ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/10' : 'bg-red-50 border-red-200 dark:bg-red-900/10'}`}>
                                                                <p className="font-medium text-xs mb-1">{q?.text || qId}</p>
                                                                <p className="text-xs">
                                                                    {t('assign.answer')}: {q ? q.options[ansIdx] : ansIdx}
                                                                    <span className="ml-2 font-semibold">{isCorrect ? t('quiz.correct') : t('quiz.incorrect')}</span>
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {gradingSubmission.attachments && (
                                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                                    <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('assign.attachments')}</h3>
                                                    <a href={gradingSubmission.attachments} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline break-all">
                                                        {gradingSubmission.attachments}
                                                    </a>
                                                </div>
                                            )}

                                            {type === 'CODE' && newLineComments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: 'var(--border-default)' }}>
                                                    <p className="text-xs font-medium mb-2">{t('review.codeComments')}</p>
                                                    {newLineComments.map((lc, i) => (
                                                        <div key={i} className={`text-xs p-1.5 rounded bg-brand-50 dark:bg-brand-500/10 flex items-center justify-between`}>
                                                            <span>{t('assign.codeLine')} {lc.lineNumber}: {lc.text}</span>
                                                            <button onClick={() => setNewLineComments(newLineComments.filter((_, idx) => idx !== i))} className="text-red-400"><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    <div>
                                        {/* Rubric Grading */}
                                        <Card padding="lg" className="sticky top-24">
                                            <h3 className="text-sm font-semibold mb-3 border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>{t('review.gradingCriteria')}</h3>
                                            <div className="space-y-4">
                                                {assignment.rubricCriteria.map((c: any, i: number) => {
                                                    const grade = criterionGrades.find(g => g.criterionId === c.id);
                                                    return (
                                                        <div key={c.id} className="p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: 'var(--border-default)' }}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={c.maxPoints}
                                                                        value={grade?.points || 0}
                                                                        onChange={e => {
                                                                            const updated = [...criterionGrades];
                                                                            const idx = updated.findIndex(g => g.criterionId === c.id);
                                                                            if (idx >= 0) updated[idx].points = Math.min(parseInt(e.target.value) || 0, c.maxPoints);
                                                                            setCriterionGrades(updated);
                                                                        }}
                                                                        className="w-16 rounded-md border px-2 py-1 text-sm text-center outline-none focus:ring-2 focus:ring-brand-500/30"
                                                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                                                    />
                                                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ {c.maxPoints}</span>
                                                                </div>
                                                            </div>
                                                            <input
                                                                placeholder={t('review.criterionComment')}
                                                                value={grade?.comment || ''}
                                                                onChange={e => {
                                                                    const updated = [...criterionGrades];
                                                                    const idx = updated.findIndex(g => g.criterionId === c.id);
                                                                    if (idx >= 0) updated[idx].comment = e.target.value;
                                                                    setCriterionGrades(updated);
                                                                }}
                                                                className="w-full rounded-md border px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-500/50"
                                                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex flex-col gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span>{t('review.finalScore')}</span>
                                                    <span className="text-brand-500 text-lg">
                                                        {criterionGrades.reduce((s, g) => s + g.points, 0)} <span className="text-sm font-normal text-zinc-500">/ {totalMaxPoints}</span>
                                                    </span>
                                                </div>

                                                <label className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 mt-2" style={{ borderColor: 'var(--border-default)' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isBestSolution}
                                                        onChange={e => setIsBestSolution(e.target.checked)}
                                                        className="w-4 h-4 rounded accent-brand-500"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('assign.addToGallery')}</p>
                                                    </div>
                                                </label>

                                                <Button onClick={handleGrade} loading={gradingLoading} className="w-full py-2.5">{t('review.saveGrade')}</Button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Peer Review Tab (Student) */}
            {tab === 'peer' && role === 'STUDENT' && (
                <div className="space-y-4">
                    {/* Other students' graded submissions for review */}
                    {(() => {
                        const othersGraded = assignment.submissions
                            .filter((s: any) => s.studentId !== userId && s.status === 'graded')
                            .reduce((acc: any, s: any) => {
                                if (!acc[s.studentId] || s.version > acc[s.studentId].version) acc[s.studentId] = s;
                                return acc;
                            }, {});
                        const submissions = Object.values(othersGraded) as any[];

                        if (submissions.length === 0) {
                            return (
                                <Card className="text-center py-12">
                                    <p style={{ color: 'var(--text-secondary)' }}>{t('peer.noReviews')}</p>
                                </Card>
                            );
                        }

                        return submissions.map((s: any) => (
                            <Card key={s.id} padding="md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {s.student?.name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {s.student?.name}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('grades.version')} #{s.version}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Average peer score */}
                                        {s.peerReviews && s.peerReviews.length > 0 && (() => {
                                            const avg = (s.peerReviews.reduce((sum: number, pr: any) => sum + pr.rating, 0) / s.peerReviews.length).toFixed(1);
                                            return <Badge variant="info" size="sm">⭐ {avg}/5 ({s.peerReviews.length})</Badge>;
                                        })()}
                                        <Badge variant="success">{t('review.graded')}</Badge>
                                    </div>
                                </div>

                                {/* Existing peer reviews */}
                                {s.peerReviews && s.peerReviews.length > 0 && (
                                    <div className="mb-3 space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{t('peer.existing')} ({s.peerReviews.length})</p>
                                        {s.peerReviews.map((pr: any) => (
                                            <div key={pr.id} className="flex items-center gap-2 text-xs p-1.5 rounded" style={{ background: 'var(--bg-secondary)' }}>
                                                <span>{'⭐'.repeat(pr.rating)}{'☆'.repeat(5 - pr.rating)}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    {pr.reviewer?.name || '#'}
                                                </span>
                                                {pr.comment && <span style={{ color: 'var(--text-tertiary)' }}>— {pr.comment.substring(0, 60)}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Show solution preview */}
                                {type === 'CODE' && <pre className="code-block text-xs overflow-x-auto max-h-40 mb-3">{(s.code || '').substring(0, 500)}{(s.code || '').length > 500 ? '...' : ''}</pre>}
                                {type === 'TEXT' && <div className="p-3 border rounded-lg text-sm mb-3 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>{(s.answerText || '').substring(0, 500)}</div>}

                                {/* Peer review form */}
                                {peerTarget === s.id ? (
                                    <div className="space-y-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('peer.rate')}</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setPeerRating(star)}
                                                        className="text-2xl transition-transform hover:scale-110"
                                                    >
                                                        {star <= peerRating ? '⭐' : '☆'}
                                                    </button>
                                                ))}
                                                <span className="text-xs self-end ml-2" style={{ color: 'var(--text-tertiary)' }}>{peerRating} {t('peer.stars')}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>{t('peer.comment')}</label>
                                            <textarea
                                                value={peerComment}
                                                onChange={e => setPeerComment(e.target.value)}
                                                placeholder={t('peer.comment')}
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 resize-y min-h-[60px]"
                                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                loading={peerSubmitting}
                                                onClick={async () => {
                                                    setPeerSubmitting(true);
                                                    try {
                                                        const res = await fetch('/api/peer-reviews', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ submissionId: s.id, rating: peerRating, comment: peerComment }),
                                                        });
                                                        if (res.ok) {
                                                            setPeerTarget(null);
                                                            setPeerComment('');
                                                            setPeerRating(5);
                                                            window.location.reload();
                                                        } else {
                                                            const data = await res.json();
                                                            alert(data.error === 'Already reviewed' ? t('peer.already') : data.error === 'Cannot review your own submission' ? t('peer.self') : data.error);
                                                        }
                                                    } finally { setPeerSubmitting(false); }
                                                }}
                                            >
                                                {t('peer.submit')}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setPeerTarget(null)}>{t('assign.cancel')}</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={() => setPeerTarget(s.id)}>{t('peer.rate')}</Button>
                                )}
                            </Card>
                        ));
                    })()}
                </div>
            )}
        </div>
    );
}
