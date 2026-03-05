import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const classId = params.id;

        const cls = await prisma.class.findUnique({
            where: { id: classId, teacherId: (session.user as any).id },
            include: {
                members: { include: { user: true } },
                assignments: {
                    include: {
                        submissions: {
                            include: { grades: true }
                        }
                    }
                }
            }
        });

        if (!cls) {
            return new NextResponse('Class not found', { status: 404 });
        }

        // Build CSV Header
        // Name, Email, Level, XP, Stability, Assignment 1 Score, Assignment 2 Score...
        const assignmentHeaders = cls.assignments.map(a => a.title).join(',');
        let csv = `Name,Email,Level,XP,Stability,${assignmentHeaders}\n`;

        // Build Rows for each student
        for (const member of cls.members) {
            const user = member.user as any;
            let row = `"${user.name}","${user.email}",${user.level || 1},${user.xp || 0},${(user.academicStability || 1).toFixed(2)}`;

            for (const assignment of cls.assignments) {
                // Find highest graded submission for this assignment by this student
                const studentSubs = assignment.submissions.filter(s => s.studentId === user.id && s.status === 'graded');
                let bestScore = 0;

                for (const sub of studentSubs) {
                    const score = sub.grades.reduce((sum, g) => sum + g.points, 0);
                    if (score > bestScore) bestScore = score;
                }

                row += `,${studentSubs.length > 0 ? bestScore : 'N/A'}`;
            }

            csv += row + '\n';
        }

        // Return CSV file
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="teachera_class_${classId}_grades.csv"`
            }
        });

    } catch (error) {
        console.error('Export Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
