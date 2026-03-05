import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const assignmentId = formData.get('assignmentId') as string;

        if (!file || !assignmentId) {
            return NextResponse.json({ error: 'file and assignmentId are required' }, { status: 400 });
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'submissions', assignmentId);
        await mkdir(uploadDir, { recursive: true });

        const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        const url = `/uploads/submissions/${assignmentId}/${uniqueName}`;

        return NextResponse.json({ url, name: file.name }, { status: 201 });
    } catch (error) {
        console.error('POST /api/submissions/upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
