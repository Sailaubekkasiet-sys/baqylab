import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET — list peer reviews for a submission
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const submissionId = searchParams.get('submissionId');
        if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

        const reviews = await (prisma as any).peerReview.findMany({
            where: { submissionId },
            include: { reviewer: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('PeerReview GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST — create a peer review
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { submissionId, rating, comment } = await request.json();
        if (!submissionId || !rating) return NextResponse.json({ error: 'submissionId and rating required' }, { status: 400 });

        const reviewerId = (session.user as any).id;

        // Prevent self-review
        const submission: any = await prisma.submissionVersion.findUnique({ where: { id: submissionId } });
        if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        if (submission.studentId === reviewerId) {
            return NextResponse.json({ error: 'Cannot review your own submission' }, { status: 400 });
        }

        // Check if already reviewed
        const existing = await (prisma as any).peerReview.findFirst({
            where: { submissionId, reviewerId }
        });
        if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

        const review = await (prisma as any).peerReview.create({
            data: {
                submissionId,
                reviewerId,
                rating: Math.min(5, Math.max(1, rating)),
                comment: comment || ''
            },
            include: { reviewer: { select: { name: true } } }
        });

        return NextResponse.json({ review });
    } catch (error) {
        console.error('PeerReview POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
