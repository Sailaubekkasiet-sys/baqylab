import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/grades/my – get all graded submissions for current student
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        const submissions = await prisma.submissionVersion.findMany({
            where: { studentId: userId, status: 'graded' },
            include: {
                assignment: {
                    select: { title: true, class: { select: { name: true } } },
                },
                grades: {
                    include: { criterion: { select: { name: true, maxPoints: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('GET /api/grades/my error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
