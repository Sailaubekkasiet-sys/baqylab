import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/classes/join – student joins class by code
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== 'STUDENT') {
            return NextResponse.json({ error: 'api.err.onlyStudentsJoin' }, { status: 403 });
        }

        const { code } = await request.json();
        if (!code || code.trim().length === 0) {
            return NextResponse.json({ error: 'api.err.codeRequired' }, { status: 400 });
        }

        const cls = await prisma.class.findUnique({
            where: { inviteCode: code.trim().toUpperCase() },
        });

        if (!cls) {
            return NextResponse.json({ error: 'api.err.classCodeNotFound' }, { status: 404 });
        }

        const userId = (session.user as any).id;

        // Check if already a member
        const existing = await prisma.classMember.findUnique({
            where: { userId_classId: { userId, classId: cls.id } },
        });

        if (existing) {
            return NextResponse.json({ error: 'api.err.alreadyJoined' }, { status: 400 });
        }

        await prisma.classMember.create({
            data: { userId, classId: cls.id },
        });

        return NextResponse.json({ classId: cls.id, className: cls.name });
    } catch (error) {
        console.error('POST /api/classes/join error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
