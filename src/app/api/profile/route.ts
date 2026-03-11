import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                xp: true,
                level: true,
                streakDays: true,
                lastActiveAt: true,
                academicStability: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get achievements
        const achievements = await (prisma as any).achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' },
        });

        // Get skill mastery
        const userSkills = await (prisma as any).userSkill.findMany({
            where: { userId },
            include: { skill: true },
            orderBy: { mastery: 'desc' },
        });

        // Get recent submissions count
        const submissionCount = await prisma.submissionVersion.count({
            where: { studentId: userId },
        });

        // Get graded submissions for average score
        const gradedSubmissions = await prisma.submissionVersion.findMany({
            where: { studentId: userId, status: 'graded' },
            include: { grades: true },
        });

        let totalEarned = 0;
        let totalMax = 0;
        gradedSubmissions.forEach(sub => {
            sub.grades.forEach(g => {
                totalEarned += g.points;
            });
        });

        // Class count
        const classCount = await (prisma as any).classMember.count({
            where: { userId },
        });

        return NextResponse.json({
            user,
            achievements,
            userSkills,
            stats: {
                submissionCount,
                gradedCount: gradedSubmissions.length,
                averageScore: gradedSubmissions.length > 0 ? (totalEarned / gradedSubmissions.length) : 0,
                classCount,
            },
        });
    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: { id: true, name: true, email: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
