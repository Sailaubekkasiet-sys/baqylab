import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — get user skills map
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        const userSkills = await (prisma as any).userSkill.findMany({
            where: { userId },
            include: { skill: { select: { id: true, name: true, color: true, category: true } } },
            orderBy: { mastery: 'desc' }
        });

        const allSkills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });

        // Merge: show all skills with mastery (0 if not learned)
        const skillMap = allSkills.map((skill: any) => {
            const userSkill = userSkills.find((us: any) => us.skillId === skill.id);
            return {
                id: skill.id,
                name: skill.name,
                color: skill.color,
                category: skill.category,
                mastery: userSkill ? userSkill.mastery : 0
            };
        });

        return NextResponse.json({ skillMap });
    } catch (error) {
        console.error('Skill map error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
