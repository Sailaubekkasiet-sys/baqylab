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

        // Get the latest graded submission per assignment for this student
        const gradedSubmissions = await prisma.submissionVersion.findMany({
            where: { studentId: userId, status: 'graded' },
            orderBy: { version: 'desc' },
            include: {
                grades: true,
                assignment: {
                    include: {
                        skills: { include: { skill: true } },
                        rubricCriteria: true,
                    },
                },
            },
        });

        // Keep only the latest version per assignment to prevent double counting
        const latestSubmissionsMap = new Map<string, typeof gradedSubmissions[0]>();
        for (const sub of gradedSubmissions) {
            if (!latestSubmissionsMap.has(sub.assignmentId)) {
                latestSubmissionsMap.set(sub.assignmentId, sub);
            }
        }
        const submissions = Array.from(latestSubmissionsMap.values());

        // Get actual user mastery from Phase 4 UserSkills
        const userSkills = await (prisma as any).userSkill.findMany({
            where: { userId },
        });
        const masteryMap = new Map(userSkills.map((us: any) => [us.skillId, us.mastery]));

        // Aggregate by skill
        const skillMap = new Map<string, {
            id: string;
            name: string;
            color: string;
            totalPoints: number;
            maxPoints: number;
            assignments: Set<string>;
            mastery: number;
        }>();

        for (const sub of submissions) {
            const totalEarned = sub.grades.reduce((s, g) => s + g.points, 0);
            const totalMax = sub.assignment.rubricCriteria.reduce((s, c) => s + c.maxPoints, 0);

            for (const as of sub.assignment.skills) {
                const skill = as.skill;
                if (!skillMap.has(skill.id)) {
                    skillMap.set(skill.id, {
                        id: skill.id,
                        name: skill.name,
                        color: skill.color,
                        totalPoints: 0,
                        maxPoints: 0,
                        assignments: new Set(),
                        mastery: (masteryMap.get(skill.id) as number) || 0,
                    });
                }
                const entry = skillMap.get(skill.id)!;
                entry.totalPoints += totalEarned;
                entry.maxPoints += totalMax;
                entry.assignments.add(sub.assignmentId);
            }
        }

        const skills = Array.from(skillMap.values()).map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            totalPoints: s.totalPoints,
            maxPoints: s.maxPoints,
            percentage: s.mastery, // Use the proper mastery value from DB
            assignmentCount: s.assignments.size,
        })).sort((a, b) => b.percentage - a.percentage);

        return NextResponse.json({ skills });
    } catch (error) {
        console.error('GET /api/skills/progress error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
