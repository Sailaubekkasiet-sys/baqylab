import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// POST /api/materials – upload file (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const classId = formData.get('classId') as string;

        if (!file || !classId) {
            return NextResponse.json({ error: 'api.err.fileClassRequired' }, { status: 400 });
        }

        // Verify class ownership
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls || cls.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), 'public', 'uploads', classId);
        await mkdir(uploadDir, { recursive: true });

        const uniqueName = `${Date.now()}-${file.name}`;
        const filePath = join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        const material = await prisma.material.create({
            data: {
                classId,
                uploaderId: (session.user as any).id,
                fileName: file.name,
                fileSize: buffer.length,
                filePath: `/uploads/${classId}/${uniqueName}`,
                mimeType: file.type || 'application/octet-stream',
            },
        });

        return NextResponse.json({ material }, { status: 201 });
    } catch (error) {
        console.error('POST /api/materials error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
