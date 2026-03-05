import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/skills/progress — student's skill progress
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        // Get all graded submissions for this student
        const submissions = await prisma.submissionVersion.findMany({
            where: { studentId: userId, status: 'graded' },
            include: {
                grades: { include: { criterion: true } },
                assignment: {
                    include: {
                        skills: { include: { skill: true } },
                        rubricCriteria: true,
                    },
                },
            },
        });

        // Aggregate by skill
        const skillMap = new Map<string, {
            name: string;
            color: string;
            totalPoints: number;
            maxPoints: number;
            assignments: Set<string>;
        }>();

        for (const sub of submissions) {
            const totalEarned = sub.grades.reduce((s, g) => s + g.points, 0);
            const totalMax = sub.assignment.rubricCriteria.reduce((s, c) => s + c.maxPoints, 0);

            for (const as of sub.assignment.skills) {
                const skill = as.skill;
                if (!skillMap.has(skill.id)) {
                    skillMap.set(skill.id, {
                        name: skill.name,
                        color: skill.color,
                        totalPoints: 0,
                        maxPoints: 0,
                        assignments: new Set(),
                    });
                }
                const entry = skillMap.get(skill.id)!;
                entry.totalPoints += totalEarned;
                entry.maxPoints += totalMax;
                entry.assignments.add(sub.assignmentId);
            }
        }

        const skills = Array.from(skillMap.values()).map(s => ({
            name: s.name,
            color: s.color,
            totalPoints: s.totalPoints,
            maxPoints: s.maxPoints,
            percentage: s.maxPoints > 0 ? Math.round((s.totalPoints / s.maxPoints) * 100) : 0,
            assignmentCount: s.assignments.size,
        })).sort((a, b) => b.percentage - a.percentage);

        return NextResponse.json({ skills });
    } catch (error) {
        console.error('GET /api/skills/progress error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
