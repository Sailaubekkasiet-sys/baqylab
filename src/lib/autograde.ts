import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestCase {
    input: string;
    expectedOutput: string;
}

interface AutoGradeResult {
    passed: number;
    total: number;
    results: { input: string; expected: string; actual: string; passed: boolean }[];
    error?: string;
}

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

/**
 * Run code against test cases and return results.
 * Supports Python and JavaScript.
 */
export async function runAutoGrade(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimitMs: number = 5000
): Promise<AutoGradeResult> {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [] };
    }

    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
        return {
            passed: 0, total: testCases.length, results: [],
            error: "JDoodle API keys are missing. Autograding requires JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in .env"
        }
    }

    const results: AutoGradeResult['results'] = [];
    let passed = 0;

    const jdoodleLang = language === 'python' ? 'python3' : 'nodejs';
    const jdoodleVersion = language === 'python' ? '4' : '4';

    for (const tc of testCases) {
        // Wrap code to read stdin and execute
        let wrappedCode = code;
        if (language === 'python') {
            wrappedCode = `import sys\ninput_data = """${tc.input.replace(/"/g, '\\"')}"""\nsys.stdin = __import__('io').StringIO(input_data)\n${code}`;
        } else {
            wrappedCode = `const __input__ = \`${tc.input.replace(/`/g, '\\`')}\`;\nconst __lines__ = __input__.split('\\n');\nlet __lineIdx__ = 0;\nconst readline = () => __lines__[__lineIdx__++] || '';\nglobal.prompt = readline;\n${code}`;
        }

        try {
            const response = await fetch('https://api.jdoodle.com/v1/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: JDOODLE_CLIENT_ID,
                    clientSecret: JDOODLE_CLIENT_SECRET,
                    script: wrappedCode,
                    language: jdoodleLang,
                    versionIndex: jdoodleVersion
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Execution failed on JDoodle');
            }

            const actual = (data.output || '').trim();
            const expected = tc.expectedOutput.trim();
            const isPassed = actual === expected;

            if (isPassed) passed++;

            results.push({
                input: tc.input,
                expected,
                actual,
                passed: isPassed,
            });
        } catch (err: any) {
            results.push({
                input: tc.input,
                expected: tc.expectedOutput.trim(),
                actual: err.message || 'Execution error',
                passed: false,
            });
        }
    }

    return { passed, total: testCases.length, results };
}

/**
 * Detect suspicious submissions:
 * - Very fast submission (< 2 min after assignment creation)
 * - Very large code on first attempt (> 5000 chars)
 * - Code similarity check (Jaccard on token sets)
 */
export function detectSuspicious(params: {
    code: string;
    version: number;
    type: string;
    assignmentCreatedAt: Date;
    otherSubmissions?: string[];
}): { isSuspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // 1. Speed check: submitted < 2 min after assignment was created
    const msSinceCreation = Date.now() - new Date(params.assignmentCreatedAt).getTime();
    if (msSinceCreation < 120000) {
        reasons.push('speed: submitted within 2 minutes of assignment creation');
    }

    // 2. First attempt with unusually large code
    if (params.version === 1 && params.type === 'CODE' && params.code && params.code.length > 5000) {
        reasons.push('size: very large code on first attempt');
    }

    // 3. Simple similarity check against other submissions (Jaccard coefficient)
    if (params.code && params.otherSubmissions && params.otherSubmissions.length > 0) {
        const tokenize = (s: string) => new Set(s.replace(/\s+/g, ' ').split(' ').filter(t => t.length > 2));
        const codeTokens = tokenize(params.code);

        for (const other of params.otherSubmissions) {
            const otherTokens = tokenize(other);
            const codeArr = Array.from(codeTokens);
            const intersection = codeArr.filter(t => otherTokens.has(t));
            const unionSize = new Set([...codeArr, ...Array.from(otherTokens)]).size;
            const jaccard = unionSize > 0 ? intersection.length / unionSize : 0;

            if (jaccard > 0.85) {
                reasons.push(`similarity: ${(jaccard * 100).toFixed(0)}% match with another submission`);
                break;
            }
        }
    }

    return {
        isSuspicious: reasons.length > 0,
        reasons,
    };
}
