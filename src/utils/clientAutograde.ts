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

/**
 * Run code against test cases and return results from the client side.
 * Relies on the provided runPython or runJavaScript functions.
 */
export async function runClientSideAutoGrade(
    code: string,
    language: string,
    testCases: TestCase[],
    runPython: (code: string) => Promise<string>,
    runJavaScript: (code: string) => Promise<string>
): Promise<AutoGradeResult> {
    if (!testCases || testCases.length === 0) {
        return { passed: 0, total: 0, results: [] };
    }

    const results: AutoGradeResult['results'] = [];
    let passed = 0;

    for (const tc of testCases) {
        // Wrap code to read stdin and execute
        let wrappedCode = code;
        if (language === 'python') {
            wrappedCode = `import sys\ninput_data = """${tc.input.replace(/"/g, '\\"')}"""\nsys.stdin = __import__('io').StringIO(input_data)\n${code}`;
        } else {
            wrappedCode = `const __input__ = \`${tc.input.replace(/`/g, '\\`')}\`;\nconst __lines__ = __input__.split('\\n');\nlet __lineIdx__ = 0;\nconst readline = () => __lines__[__lineIdx__++] || '';\nwindow.prompt = readline;\n${code}`;
        }

        try {
            let stdout = '';
            if (language === 'python') {
                stdout = await runPython(wrappedCode);
            } else if (language === 'javascript') {
                stdout = await runJavaScript(wrappedCode);
            }

            const actual = stdout.trim();
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
