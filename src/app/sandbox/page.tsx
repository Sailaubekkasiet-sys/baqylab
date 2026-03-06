'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/I18nProvider';

import { usePython } from '@/hooks/usePython';
import { runJavaScript } from '@/hooks/useJavaScript';

// A simple IDE-like code editor, reusing existing styling
export default function SandboxPage() {
    const { t } = useI18n();
    const [code, setCode] = useState('print("Hello, Sandbox!")');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);

    // Python WASM hook
    const { run: runPython, isLoaded: isPythonLoaded, isLoading: isPythonLoading } = usePython();

    const handleRun = async () => {
        if (language === 'python' && !isPythonLoaded) {
            setOutput('Python environment is still loading. Please wait...');
            return;
        }

        setRunning(true);
        setOutput(t('sandbox.running'));

        try {
            let result = '';
            if (language === 'python') {
                result = await runPython(code);
            } else if (language === 'javascript') {
                result = await runJavaScript(code);
            }

            setOutput(result || t('sandbox.noOutput'));
        } catch (error: any) {
            setOutput(error.message || t('sandbox.error'));
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('sandbox.title')}</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('sandbox.desc')}</p>
                </div>

                <div className="flex items-center gap-2">
                    {language === 'python' && isPythonLoading && (
                        <span className="text-xs text-amber-500 animate-pulse hidden sm:inline-block">Loading Python...</span>
                    )}
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-lg border px-3 py-2 text-sm outline-none bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-primary)]"
                    >
                        <option value="python">Python 3 (WASM)</option>
                        <option value="javascript">JavaScript (IFrame)</option>
                    </select>
                    <Button
                        onClick={handleRun}
                        disabled={language === 'python' && !isPythonLoaded}
                        loading={running}
                        className="flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>{t('sandbox.runBtn')}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh] min-h-[400px]">
                <Card padding="sm" className="h-full flex flex-col p-0 overflow-hidden relative group">
                    <div className="bg-black/5 dark:bg-white/5 px-4 py-2 border-b border-[var(--border)] flex justify-between items-center text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)]">
                        <span>Code Editor</span>
                        <span>{language}</span>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full bg-transparent p-4 outline-none resize-none font-mono text-sm leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                        spellCheck={false}
                    />
                </Card>

                <Card padding="sm" className="h-full flex flex-col p-0 overflow-hidden relative group">
                    <div className="bg-black/5 dark:bg-white/5 px-4 py-2 border-b border-[var(--border)] flex justify-between items-center text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)]">
                        <span>Terminal Output</span>
                        {running && <span className="animate-pulse">Running...</span>}
                    </div>
                    <pre className="flex-1 w-full bg-[#1e1e1e] p-4 overflow-auto font-mono text-sm text-gray-300">
                        {output || t('sandbox.ready')}
                    </pre>
                </Card>
            </div>
        </div>
    );
}
