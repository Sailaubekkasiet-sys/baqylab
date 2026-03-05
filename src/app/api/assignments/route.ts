import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/assignments – create assignment with rubric + selfchecks + skills (teacher only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { classId, title, description, dueDate, hardDeadline, language, type, textPrompt, quizData, rubricCriteria, selfCheckItems, skillIds, testCases, timeLimitMs, memoryLimitMb, difficulty, xpReward } = body;

        if (!classId || !title) {
            return NextResponse.json({ error: 'api.err.classTitleRequired' }, { status: 400 });
        }

        // Verify ownership
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls || cls.teacherId !== (session.user as any).id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const count = await prisma.assignment.count({ where: { classId } });

        const assignment = await prisma.assignment.create({
            data: {
                classId,
                title: title.trim(),
                description: description || '',
                dueDate: dueDate ? new Date(dueDate) : null,
                hardDeadline: hardDeadline ? new Date(hardDeadline) : null,
                language: language || 'python',
                type: type || 'CODE',
                textPrompt: textPrompt || '',
                quizData: quizData || '[]',
                order: count,
                difficulty: difficulty || 'BASIC',
                xpReward: parseInt(xpReward) || 100,
                testCases: JSON.stringify(testCases || []),
                timeLimitMs: timeLimitMs || 5000,
                memoryLimitMb: memoryLimitMb || 128,
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

        return NextResponse.json({ assignment }, { status: 201 });
    } catch (error) {
        console.error('POST /api/assignments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
