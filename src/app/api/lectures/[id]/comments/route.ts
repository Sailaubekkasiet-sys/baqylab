import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { text, parentId } = await request.json();
        if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

        const comment = await (prisma as any).comment.create({
            data: {
                text,
                authorId: (session.user as any).id,
                lectureId: params.id,
                parentId: parentId || null
            },
            include: { author: { select: { name: true, role: true } } }
        });

        return NextResponse.json({ comment });
    } catch (error) {
        console.error('Comment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
