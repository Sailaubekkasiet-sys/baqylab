import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const lecture: any = await prisma.lecture.findUnique({
            where: { id: params.id },
            include: {
                class: { select: { id: true, teacherId: true, members: { select: { userId: true } } } },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: { author: { select: { name: true, role: true } } }
                }
            } as any
        });

        if (!lecture) return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });

        // Authorization
        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const isTeacher = role === 'TEACHER' && lecture?.class?.teacherId === userId;
        const isMember = lecture?.class?.members?.some((m: any) => m.userId === userId);

        if (!isTeacher && !isMember) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ lecture });
    } catch (error) {
        console.error('Fetch lecture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title, content, resources } = await request.json();

        const lecture = await prisma.lecture.findUnique({
            where: { id: params.id },
            include: { class: true }
        });

        if (!lecture) return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });

        // Update authorization
        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const isAdmin = role === 'ADMIN';
        const isTeacher = role === 'TEACHER' && lecture.class.teacherId === userId;

        if (!isAdmin && !isTeacher) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await prisma.lecture.update({
            where: { id: params.id },
            data: {
                title,
                content,
                resources: resources ? JSON.stringify(resources) : undefined
            }
        });

        return NextResponse.json({ lecture: updated });

    } catch (error) {
        console.error('Update lecture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
