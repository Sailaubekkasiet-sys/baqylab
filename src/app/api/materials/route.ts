import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/materials — save material metadata (file already uploaded to Vercel Blob via /api/upload)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { classId, fileName, fileSize, filePath, mimeType } = await request.json();

        if (!classId || !fileName || !filePath) {
            return NextResponse.json({ error: 'classId, fileName, and filePath are required' }, { status: 400 });
        }

        // Verify teacher owns the class
        const cls = await prisma.class.findUnique({
            where: { id: classId },
            select: { teacherId: true },
        });

        if (!cls || cls.teacherId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Save material record in DB
        const material = await prisma.material.create({
            data: {
                classId,
                uploaderId: userId,
                fileName,
                fileSize: fileSize || 0,
                filePath,
                mimeType: mimeType || 'application/octet-stream',
            },
        });

        return NextResponse.json({ material }, { status: 201 });
    } catch (error) {
        console.error('POST /api/materials error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
