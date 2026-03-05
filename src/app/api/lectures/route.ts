import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/lectures – create lecture (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { classId, title, content, resources } = await request.json();
        if (!classId || !title) {
            return NextResponse.json({ error: 'api.err.classTitleRequired' }, { status: 400 });
        }

        // Verify ownership
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls || cls.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const count = await prisma.lecture.count({ where: { classId } });

        // Ensure resources is properly stringified JSON array
        const safeResources = Array.isArray(resources) ? JSON.stringify(resources) : '[]';

        const lecture = await prisma.lecture.create({
            data: {
                classId,
                title: title.trim(),
                content: content || '',
                resources: safeResources,
                order: count,
            },
        });

        return NextResponse.json({ lecture }, { status: 201 });
    } catch (error) {
        console.error('POST /api/lectures error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
