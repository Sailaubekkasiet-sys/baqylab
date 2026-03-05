import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code, language } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'api.err.noCode' }, { status: 400 });
        }

        if (language !== 'python' && language !== 'javascript') {
            return NextResponse.json({ error: 'api.err.lang' }, { status: 400 });
        }

        const fileId = randomUUID();
        const extension = language === 'python' ? 'py' : 'js';
        const filePath = join(tmpdir(), `sandbox-${fileId}.${extension}`);

        await writeFile(filePath, code, 'utf-8');

        try {
            const command = language === 'python'
                ? `python3 ${filePath}`
                : `node ${filePath}`;

            // Execute with 5 seconds timeout to prevent infinite loops
            const { stdout, stderr } = await execAsync(command, { timeout: 5000 });

            await unlink(filePath).catch(console.error);

            return NextResponse.json({
                output: stdout,
                error: stderr || null
            });
        } catch (execError: any) {
            await unlink(filePath).catch(console.error);

            return NextResponse.json({
                output: null,
                error: execError.stderr || execError.message || 'api.err.exec'
            });
        }
    } catch (error) {
        console.error('POST /api/execute error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
