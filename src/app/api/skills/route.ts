import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/skills – list all skills
export async function GET() {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ skills });
}

// POST /api/skills – create skill (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { name, description, color } = await request.json();
        if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

        const skill = await prisma.skill.upsert({
            where: { name: name.trim() },
            update: {},
            create: { name: name.trim(), description: description || '', color: color || '#6366f1' },
        });

        return NextResponse.json({ skill });
    } catch (error) {
        console.error('POST /api/skills error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
