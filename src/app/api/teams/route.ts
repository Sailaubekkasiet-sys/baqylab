import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/teams?classId=xxx — list teams for a class
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        if (!classId) return NextResponse.json({ error: 'classId required' }, { status: 400 });

        const teams = await prisma.team.findMany({
            where: { classId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true, xp: true, level: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ teams });
    } catch (error) {
        console.error('GET /api/teams error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/teams — create a team (teacher only)
// Body: { classId, name, memberIds: string[] }
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { classId, name, memberIds } = await request.json();

        if (!classId || !name) return NextResponse.json({ error: 'classId and name required' }, { status: 400 });

        // Verify teacher owns the class
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls || cls.teacherId !== userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const team = await prisma.team.create({
            data: {
                classId,
                name,
                members: {
                    create: (memberIds || []).map((uid: string) => ({ userId: uid })),
                },
            },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } },
            },
        });

        return NextResponse.json({ team }, { status: 201 });
    } catch (error) {
        console.error('POST /api/teams error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/teams — assign grade to entire team, distributed evenly
// Body: { teamId, totalScore, maxScore }
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { teamId, totalScore, maxScore } = await request.json();

        if (!teamId || totalScore === undefined) {
            return NextResponse.json({ error: 'teamId and totalScore required' }, { status: 400 });
        }

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                class: true,
                members: { include: { user: true } },
            },
        });

        if (!team || team.class.teacherId !== userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Distribute XP evenly across team members
        const memberCount = team.members.length || 1;
        const xpPerMember = Math.round(totalScore / memberCount);

        const updates = team.members.map(m =>
            prisma.user.update({
                where: { id: m.userId },
                data: { xp: { increment: xpPerMember } },
            })
        );

        await Promise.all(updates);

        return NextResponse.json({
            team: team.name,
            totalScore,
            xpPerMember,
            members: team.members.map(m => ({ id: m.userId, name: m.user.name, xpAwarded: xpPerMember })),
        });
    } catch (error) {
        console.error('PATCH /api/teams error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
