import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const cls = await prisma.class.findUnique({
            where: { id: params.id },
            include: {
                teacher: { select: { name: true } },
                lectures: { orderBy: { order: 'asc' } },
                assignments: {
                    orderBy: { order: 'asc' },
                    include: {
                        skills: { include: { skill: { select: { name: true, color: true } } } },
                        _count: { select: { submissions: true, rubricCriteria: true } },
                        submissions: {
                            where: { isBestSolution: true, status: 'graded' } as any,
                            select: { id: true, code: true, answerText: true, attachments: true, student: { select: { name: true } }, studentId: true }
                        }
                    },
                },
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                materials: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!cls) {
            return NextResponse.json({ error: 'class.notFound' }, { status: 404 });
        }

        if (role === 'TEACHER' && cls.teacherId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (role === 'STUDENT') {
            const isMember = (cls as any).members.some((m: any) => m.user.id === userId);
            if (!isMember) {
                return NextResponse.json({ error: 'api.err.notInClass' }, { status: 403 });
            }
        }

        return NextResponse.json({ class: cls });
    } catch (error) {
        console.error('GET /api/classes/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
