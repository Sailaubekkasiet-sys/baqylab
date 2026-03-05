import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

// GET /api/materials/[id]/download — download file
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const material = await prisma.material.findUnique({
            where: { id: params.id },
            include: { class: { include: { members: true } } },
        });

        if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Check access: teacher owns it or student is a member
        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        if (role === 'TEACHER' && material.class.teacherId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (role === 'STUDENT' && !material.class.members.some(m => m.userId === userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const filePath = join(process.cwd(), 'public', material.filePath);
        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': material.mimeType,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(material.fileName)}"`,
            },
        });
    } catch (error) {
        console.error('GET /api/materials/[id]/download error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
