import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const classId = params.id;

        // Verify teacher owns the class
        const cls = await prisma.class.findUnique({
            where: { id: classId, teacherId: (session.user as any).id },
            include: {
                members: { include: { user: true } },
                assignments: {
                    include: {
                        submissions: {
                            include: { grades: true }
                        },
                        skills: { include: { skill: true } }
                    }
                }
            }
        });

        if (!cls) {
            return NextResponse.json({ error: 'api.err.classNoAccess' }, { status: 404 });
        }

        // Calculate Analytics
        let totalScore = 0;
        let gradedSubmissions = 0;
        let totalSubmissions = 0;

        const studentStats: Record<string, { name: string, stability: number, totalXP: number, level: number, streakDays: number }> = {};
        const skillStats: Record<string, { name: string, totalPoints: number, maxPoints: number }> = {};

        cls.members.forEach(m => {
            studentStats[m.userId] = {
                name: m.user.name,
                stability: (m.user as any).academicStability || 1.0,
                totalXP: (m.user as any).xp || 0,
                level: (m.user as any).level || 1,
                streakDays: (m.user as any).streakDays || 0,
            };
        });

        cls.assignments.forEach(assignment => {
            assignment.submissions.forEach(sub => {
                totalSubmissions++;

                const score = sub.grades.reduce((sum, g) => sum + g.points, 0);
                if (sub.status === 'graded') {
                    totalScore += score;
                    gradedSubmissions++;

                    // Aggregate skills
                    assignment.skills.forEach(s => {
                        if (!skillStats[s.skillId]) {
                            skillStats[s.skillId] = { name: s.skill.name, totalPoints: 0, maxPoints: 0 };
                        }
                        skillStats[s.skillId].totalPoints += score;
                        skillStats[s.skillId].maxPoints += ((assignment as any).xpReward || 100) / 10;
                    });
                }
            });
        });

        const averageScore = gradedSubmissions > 0 ? totalScore / gradedSubmissions : 0;

        // At risk students (stability < 0.5 or 0 xp if class has assignments)
        const atRiskStudents = Object.entries(studentStats)
            .filter(([_, stats]) => stats.stability < 0.6 || (totalSubmissions > 0 && stats.totalXP < 50))
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => a.stability - b.stability)
            .slice(0, 5);

        // Weak skills
        const weakSkills = Object.values(skillStats)
            .filter(s => s.maxPoints > 0)
            .map(s => ({ name: s.name, score: (s.totalPoints / s.maxPoints) * 100 }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 5);

        // Student leaderboard (top 10 by XP)
        const studentLeaderboard = Object.entries(studentStats)
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.totalXP - a.totalXP)
            .slice(0, 10);

        return NextResponse.json({
            averageScore,
            totalSubmissions,
            atRiskStudents,
            weakSkills,
            studentLeaderboard,
        });

    } catch (error) {
        console.error('Teacher Analytics Error:', error);
        return NextResponse.json({ error: 'api.err.serverAnalytics' }, { status: 500 });
    }
}
