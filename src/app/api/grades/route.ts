import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processGradingGamification } from '@/lib/gamification';

// POST /api/grades – grade a submission by rubric (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { submissionId, criterionGrades, lineComments, isBestSolution } = await request.json();

        if (!submissionId) {
            return NextResponse.json({ error: 'api.err.submissionIdRequired' }, { status: 400 });
        }

        const submission = await prisma.submissionVersion.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: {
                        class: true,
                        rubricCriteria: true,
                    },
                },
            },
        });

        if (!submission) return NextResponse.json({ error: 'api.err.workNotFound' }, { status: 404 });
        if (submission.assignment.class.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Upsert criterion grades
        if (criterionGrades && Array.isArray(criterionGrades)) {
            for (const cg of criterionGrades) {
                await prisma.criterionGrade.upsert({
                    where: {
                        submissionId_criterionId: {
                            submissionId,
                            criterionId: cg.criterionId,
                        },
                    },
                    update: {
                        points: cg.points,
                        comment: cg.comment || '',
                    },
                    create: {
                        submissionId,
                        criterionId: cg.criterionId,
                        points: cg.points,
                        comment: cg.comment || '',
                    },
                });
            }
        }

        // Add line comments
        if (lineComments && Array.isArray(lineComments)) {
            for (const lc of lineComments) {
                await prisma.lineComment.create({
                    data: {
                        submissionId,
                        authorId: (session.user as any).id,
                        lineNumber: lc.lineNumber,
                        text: lc.text,
                        type: lc.type || 'tip',
                    },
                });
            }
        }

        // Mark as graded
        await prisma.submissionVersion.update({
            where: { id: submissionId },
            data: { status: 'graded', isBestSolution: !!isBestSolution } as any,
        });

        // ── Post-grading gamification ──────────────────────────
        // Calculate earned and max points from criterion grades
        let earnedPoints = 0;
        let maxPoints = 0;

        if (criterionGrades && Array.isArray(criterionGrades)) {
            for (const cg of criterionGrades) {
                earnedPoints += cg.points || 0;
            }
        }

        // Get max points from rubric criteria
        for (const criterion of submission.assignment.rubricCriteria) {
            maxPoints += criterion.maxPoints;
        }

        const gamification = await processGradingGamification({
            studentId: submission.studentId,
            assignmentId: submission.assignmentId,
            xpReward: submission.assignment.xpReward || 100,
            earnedPoints,
            maxPoints,
        });

        return NextResponse.json({ success: true, gamification });
    } catch (error) {
        console.error('POST /api/grades error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

