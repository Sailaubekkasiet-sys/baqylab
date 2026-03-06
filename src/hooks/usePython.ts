'use client';

import { useState, useEffect, useRef } from 'react';

export function usePython() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pyodideRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        const loadPyodideScript = async () => {
            try {
                // Ensure script is only loaded once
                if (!document.getElementById('pyodide-script')) {
                    const script = document.createElement('script');
                    script.id = 'pyodide-script';
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    document.head.appendChild(script);

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to load Pyodide script'));
                    });
                }

                if (mounted && (window as any).loadPyodide) {
                    const pyodide = await (window as any).loadPyodide({
                        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
                    });

                    if (mounted) {
                        pyodideRef.current = pyodide;
                        setIsLoaded(true);
                        setIsLoading(false);
                    }
                }
            } catch (err: any) {
                if (mounted) {
                    console.error('Pyodide initialization error:', err);
                    setError(err.message || 'Failed to initialize Python environment');
                    setIsLoading(false);
                }
            }
        };

        loadPyodideScript();

        return () => {
            mounted = false;
        };
    }, []);

    const run = async (code: string): Promise<string> => {
        if (!isLoaded || !pyodideRef.current) {
            throw new Error('Python environment is not ready yet');
        }

        const pyodide = pyodideRef.current;
        let output = '';

        try {
            // Set up standard output interception
            pyodide.setStdout({
                batched: (msg: string) => {
                    output += msg + '\n';
                }
            });

            // Set up standard error interception
            pyodide.setStderr({
                batched: (msg: string) => {
                    output += msg + '\n';
                }
            });

            // Execute the code
            const result = await pyodide.runPythonAsync(code);

            // Add the return value if there is one and it wasn't printed
            if (result !== undefined && typeof result !== 'function') {
                output += String(result) + '\n';
            }

            return output.trim();
        } catch (err: any) {
            // Include Python traceback
            return (output + '\n' + err.toString()).trim();
        }
    };

    return { run, isLoaded, isLoading, error };
}
