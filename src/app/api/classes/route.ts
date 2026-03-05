import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateInviteCode } from '@/lib/utils';

// GET /api/classes – list classes for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        let classes;
        let achievements: any[] = [];
        if (role === 'TEACHER') {
            classes = await prisma.class.findMany({
                where: { teacherId: userId },
                include: {
                    _count: { select: { members: true, assignments: true, lectures: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            classes = await prisma.class.findMany({
                where: {
                    members: { some: { userId } },
                },
                include: {
                    teacher: { select: { name: true } },
                    _count: { select: { members: true, assignments: true, lectures: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            achievements = await prisma.achievement.findMany({
                where: { userId },
                orderBy: { earnedAt: 'desc' },
            });
        }

        return NextResponse.json({ classes, achievements });
    } catch (error) {
        console.error('GET /api/classes error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/classes – create a new class (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== 'TEACHER') {
            return NextResponse.json({ error: 'api.err.onlyTeacherCreate' }, { status: 403 });
        }

        const { name, description } = await request.json();
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'api.err.classNameRequired' }, { status: 400 });
        }

        // Generate unique invite code
        let inviteCode = generateInviteCode();
        let attempts = 0;
        while (await prisma.class.findUnique({ where: { inviteCode } })) {
            inviteCode = generateInviteCode();
            attempts++;
            if (attempts > 10) break;
        }

        const newClass = await prisma.class.create({
            data: {
                name: name.trim(),
                description: description?.trim() || '',
                inviteCode,
                teacherId: (session.user as any).id,
            },
        });

        return NextResponse.json({ class: newClass }, { status: 201 });
    } catch (error) {
        console.error('POST /api/classes error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
