import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processSubmissionGamification } from '@/lib/gamification';
import { runAutoGrade } from '@/lib/autograde';

// POST /api/submissions – submit new version (student)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { assignmentId, code, answerText, quizAnswers, attachments, fileName, selfChecks } = await request.json();

        if (!assignmentId) {
            return NextResponse.json({ error: 'api.err.assignRequired' }, { status: 400 });
        }

        // Get assignment + verify student is in the class
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                class: { include: { members: true } },
                selfCheckItems: { where: { required: true } },
            },
        });

        if (!assignment) return NextResponse.json({ error: 'api.err.assignNotFound' }, { status: 404 });

        const isMember = assignment.class.members.some((m) => m.userId === userId);
        if (!isMember) return NextResponse.json({ error: 'api.err.notInClassShort' }, { status: 403 });

        // Hard deadline: reject entirely
        const hardDeadline = (assignment as any).hardDeadline ? new Date((assignment as any).hardDeadline) : null;
        if (hardDeadline && new Date() > hardDeadline) {
            return NextResponse.json({ error: 'Hard deadline passed. Submissions closed.' }, { status: 403 });
        }

        // Check self-check items
        const requiredChecks = assignment.selfCheckItems.map((s) => s.id);
        const completedChecks = selfChecks || [];
        const allChecked = requiredChecks.every((id) => completedChecks.includes(id));

        // Get next version number
        const lastVersion = await prisma.submissionVersion.findFirst({
            where: { assignmentId, studentId: userId },
            orderBy: { version: 'desc' },
        });

        const version = (lastVersion?.version || 0) + 1;

        // Auto-grade if test cases exist
        let autoResults = null;
        if (assignment.type === 'CODE' && code && assignment.testCases && assignment.testCases !== '[]') {
            try {
                const testCases = JSON.parse(assignment.testCases);
                if (testCases.length > 0) {
                    autoResults = await runAutoGrade(code, assignment.language, testCases, assignment.timeLimitMs || 5000);
                }
            } catch (e) {
                console.error('Auto-grade error:', e);
            }
        }

        // Create the submission
        const submission = await prisma.submissionVersion.create({
            data: {
                assignmentId,
                studentId: userId,
                version,
                code: code || '',
                answerText: answerText || undefined,
                quizAnswers: quizAnswers || undefined,
                attachments: attachments || undefined,
                fileName: fileName || 'solution.py',
                status: allChecked ? 'submitted' : 'draft',
                selfChecks: JSON.stringify(completedChecks),
                autoResults: autoResults ? JSON.stringify(autoResults) : undefined,
            },
        });

        // Gamification pipeline (only when fully submitted)
        let gamification = null;
        if (allChecked) {
            const softDeadline = assignment.dueDate ? new Date(assignment.dueDate) : null;

            gamification = await processSubmissionGamification({
                userId,
                assignmentId,
                xpReward: assignment.xpReward || 100,
                version,
                dueDate: softDeadline,
                hardDeadline,
            });
        }

        return NextResponse.json({
            submission,
            gamification,
            autoResults,
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
