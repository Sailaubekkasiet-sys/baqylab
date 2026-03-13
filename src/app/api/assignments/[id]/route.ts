import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/assignments/[id] — full assignment detail
// PUT /api/assignments/[id] — update assignment (teacher only)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const existing = await prisma.assignment.findUnique({
            where: { id: params.id },
            include: { class: { select: { teacherId: true } } },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (existing.class.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title, description, dueDate, hardDeadline, language, type,
            textPrompt, quizData, rubricCriteria, selfCheckItems, skillIds,
            testCases, timeLimitMs, memoryLimitMb, difficulty, xpReward,
        } = body;

        const assignment = await prisma.$transaction(async (tx) => {
            // Delete existing relations
            await tx.rubricCriterion.deleteMany({ where: { assignmentId: params.id } });
            await tx.selfCheckItem.deleteMany({ where: { assignmentId: params.id } });
            await tx.assignmentSkill.deleteMany({ where: { assignmentId: params.id } });

            // Update assignment + re-create relations
            return tx.assignment.update({
                where: { id: params.id },
                data: {
                    title: title?.trim() ?? existing.title,
                    description: description ?? existing.description,
                    dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
                    hardDeadline: hardDeadline !== undefined ? (hardDeadline ? new Date(hardDeadline) : null) : existing.hardDeadline,
                    language: language ?? existing.language,
                    type: type ?? existing.type,
                    textPrompt: textPrompt ?? existing.textPrompt,
                    quizData: quizData ?? existing.quizData,
                    difficulty: difficulty ?? existing.difficulty,
                    xpReward: xpReward !== undefined ? (parseInt(xpReward) || 100) : existing.xpReward,
                    testCases: testCases !== undefined ? JSON.stringify(testCases) : existing.testCases,
                    timeLimitMs: timeLimitMs ?? existing.timeLimitMs,
                    memoryLimitMb: memoryLimitMb ?? existing.memoryLimitMb,
                    rubricCriteria: {
                        create: (rubricCriteria || []).map((c: any, i: number) => ({
                            name: c.name,
                            description: c.description || '',
                            maxPoints: c.maxPoints || 10,
                            type: c.type || 'scale',
                            order: i,
                        })),
                    },
                    selfCheckItems: {
                        create: (selfCheckItems || []).map((s: any, i: number) => ({
                            label: s.label,
                            required: s.required !== false,
                            order: i,
                        })),
                    },
                    skills: {
                        create: (skillIds || []).map((sid: string) => ({
                            skillId: sid,
                        })),
                    },
                },
                include: {
                    rubricCriteria: true,
                    selfCheckItems: true,
                    skills: { include: { skill: true } },
                },
            });
        });

        return NextResponse.json({ assignment });
    } catch (error) {
        console.error('PUT /api/assignments/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET /api/assignments/[id] — full assignment detail
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;

        const assignment = await prisma.assignment.findUnique({
            where: { id: params.id },
            include: {
                class: { select: { id: true, name: true, teacherId: true } },
                rubricCriteria: { orderBy: { order: 'asc' } },
                selfCheckItems: { orderBy: { order: 'asc' } },
                skills: { include: { skill: true } },
                submissions: {
                    orderBy: { version: 'desc' },
                    include: {
                        student: { select: { id: true, name: true, email: true } },
                        lineComments: { include: { author: { select: { name: true } } } },
                        grades: { include: { criterion: true } },
                    },
                },
            },
        });

        if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ assignment });
    } catch (error) {
        console.error('GET /api/assignments/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/assignments/[id] — delete assignment (teacher only)
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const existing = await prisma.assignment.findUnique({
            where: { id: params.id },
            include: { class: { select: { teacherId: true } } },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (existing.class.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.assignment.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/assignments/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
