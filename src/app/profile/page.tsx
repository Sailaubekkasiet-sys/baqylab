import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/login');
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
        redirect('/login');
    }

    const isTeacher = user.role === 'TEACHER';

    if (isTeacher) {
        // Teacher-specific data
        const ownedClasses = await prisma.class.findMany({
            where: { teacherId: userId },
            include: { members: true, lectures: true, assignments: true },
        });

        const totalStudents = ownedClasses.reduce((acc, c) => acc + c.members.length, 0);
        const totalLectures = ownedClasses.reduce((acc, c) => acc + c.lectures.length, 0);
        const totalAssignments = ownedClasses.reduce((acc, c) => acc + c.assignments.length, 0);

        // Count total submissions graded by this teacher (across their classes)
        const classIds = ownedClasses.map(c => c.id);
        const totalGraded = await prisma.submissionVersion.count({
            where: {
                assignment: { classId: { in: classIds } },
                status: 'graded',
            },
        });

        return (
            <ProfileClient
                profile={{
                    user,
                    teacherStats: {
                        classCount: ownedClasses.length,
                        totalStudents,
                        totalLectures,
                        totalAssignments,
                        totalGraded,
                        classes: ownedClasses.map(c => ({
                            id: c.id,
                            name: c.name,
                            studentCount: c.members.length,
                            lectureCount: c.lectures.length,
                            assignmentCount: c.assignments.length,
                        })),
                    },
                }}
            />
        );
    }

    // Student-specific data
    const achievements = await (prisma as any).achievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
    });

    const userSkills = await (prisma as any).userSkill.findMany({
        where: { userId },
        include: { skill: true },
        orderBy: { mastery: 'desc' },
    });

    const submissionCount = await prisma.submissionVersion.count({
        where: { studentId: userId },
    });

    const gradedSubmissions = await prisma.submissionVersion.findMany({
        where: { studentId: userId, status: 'graded' },
        include: { grades: true },
    });

    let totalEarned = 0;
    gradedSubmissions.forEach((sub: any) => {
        sub.grades.forEach((g: any) => {
            totalEarned += g.points;
        });
    });

    const classCount = await (prisma as any).classMember.count({
        where: { userId },
    });

    return (
        <ProfileClient
            profile={{
                user,
                achievements,
                userSkills,
                stats: {
                    submissionCount,
                    gradedCount: gradedSubmissions.length,
                    averageScore: gradedSubmissions.length > 0 ? (totalEarned / gradedSubmissions.length) : 0,
                    classCount,
                },
            }}
        />
    );
}
