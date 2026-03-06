import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

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

        if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
            return NextResponse.json({ error: 'JDoodle API keys are missing. Please configure JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in your .env / Vercel settings for cloud code execution.' }, { status: 500 });
        }

        const jdoodleLang = language === 'python' ? 'python3' : 'nodejs';
        const jdoodleVersion = language === 'python' ? '4' : '4';

        const response = await fetch('https://api.jdoodle.com/v1/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: JDOODLE_CLIENT_ID,
                clientSecret: JDOODLE_CLIENT_SECRET,
                script: code,
                language: jdoodleLang,
                versionIndex: jdoodleVersion
            })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return NextResponse.json({
                output: null,
                error: data.error || 'Execution failed on JDoodle'
            });
        }

        return NextResponse.json({
            output: data.output || '',
            error: null
        });

    } catch (error) {
        console.error('POST /api/execute error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
