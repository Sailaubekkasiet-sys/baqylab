export const runJavaScript = async (code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Create an iframe to sandbox the execution
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';

        // Critical: The sandbox attribute restricts the iframe.
        // allow-scripts is needed to run the code.
        // OMITTING allow-same-origin prevents the code from accessing parent window/cookies.
        iframe.setAttribute('sandbox', 'allow-scripts');

        // Prepare the script content with output interception
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Sandbox</title>
                </head>
                <body>
                    <script>
                        let output = '';
                        
                        // Override console methods to capture output
                        const originalLog = console.log;
                        const originalError = console.error;
                        const originalWarn = console.warn;
                        const originalInfo = console.info;

                        function capture(...args) {
                            const msg = args.map(arg => 
                                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' ');
                            output += msg + '\\n';
                        }

                        console.log = function(...args) {
                            capture(...args);
                            originalLog.apply(console, args);
                        };
                        console.error = function(...args) {
                            capture(...args);
                            originalError.apply(console, args);
                        };
                        console.warn = function(...args) {
                            capture(...args);
                            originalWarn.apply(console, args);
                        };
                        console.info = function(...args) {
                            capture(...args);
                            originalInfo.apply(console, args);
                        };

                        // Send result back to parent window
                        window.onmessage = function(event) {
                            if (event.data.type === 'execute') {
                                try {
                                    // Using Function constructor rather than eval for slightly better semantics,
                                    // though in an isolated iframe eval is also isolated.
                                    const executeCode = new Function(event.data.code);
                                    const result = executeCode();
                                    
                                    if (result !== undefined) {
                                        output += String(result) + '\\n';
                                    }
                                    
                                    window.parent.postMessage({ type: 'result', output: output.trim(), sourceId: event.data.sourceId }, '*');
                                } catch (error) {
                                    output += String(error) + '\\n';
                                    window.parent.postMessage({ type: 'error', output: output.trim(), sourceId: event.data.sourceId }, '*');
                                }
                            }
                        };
                    </script>
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const objectUrl = URL.createObjectURL(blob);
        iframe.src = objectUrl;

        const sourceId = Math.random().toString(36).substring(7);

        // Listen for the response from the iframe
        const messageHandler = (event: MessageEvent) => {
            // Check if the response matches our execution ID
            if (event.data && event.data.sourceId === sourceId) {
                window.removeEventListener('message', messageHandler);
                document.body.removeChild(iframe);
                URL.revokeObjectURL(objectUrl);

                if (event.data.type === 'result' || event.data.type === 'error') {
                    resolve(event.data.output || '');
                }
            }
        };

        window.addEventListener('message', messageHandler);

        // Once iframe loads, send the code to execute
        iframe.onload = () => {
            // We can't use targetOrigin=objectUrl because the origin of blob URLs
            // inside a sandbox without allow-same-origin is 'null'. So we use '*'.
            // This is safe because only this randomly named sourceId will trigger our listener.
            iframe.contentWindow?.postMessage({ type: 'execute', code, sourceId }, '*');
        };

        // If iframe fails to load or hangs
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(objectUrl);
            }
            reject(new Error('Execution timed out'));
        }, 5000);

        document.body.appendChild(iframe);
    });
};
