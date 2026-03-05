import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/assignments/[id] — full assignment detail
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        const assignment = await prisma.assignment.findUnique({
            where: { id: params.id },
            include: {
                class: { select: { id: true, name: true, teacherId: true } },
                rubricCriteria: { orderBy: { order: 'asc' } },
                selfCheckItems: { orderBy: { order: 'asc' } },
                skills: { include: { skill: true } },
                submissions: {
                    orderBy: { version: 'desc' },
                    include: {
                        student: { select: { id: true, name: true, email: true } },
                        lineComments: { include: { author: { select: { name: true } } } },
                        grades: { include: { criterion: true } },
                    },
                },
            },
        });

        if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ assignment });
    } catch (error) {
        console.error('GET /api/assignments/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
