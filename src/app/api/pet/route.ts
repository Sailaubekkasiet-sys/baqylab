import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/pet – fetch pet + apply hunger mechanic
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userSession = session.user as any;
        if (userSession.role !== 'STUDENT') {
            return NextResponse.json({ pet: null });
        }

        const userId = userSession.id;

        const pet = await prisma.pet.findUnique({ where: { userId } });
        if (!pet) {
            return NextResponse.json({ pet: null });
        }

        // Hunger mechanic: if user inactive > 48h, decrease health by 20
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastActiveAt: true },
        });

        if (user?.lastActiveAt) {
            const hoursSince =
                (Date.now() - new Date(user.lastActiveAt).getTime()) / 3600000;

            if (hoursSince > 48) {
                const newHealth = Math.max(0, pet.health - 20);
                const updated = await prisma.pet.update({
                    where: { userId },
                    data: { health: newHealth, lastInteraction: new Date() },
                });
                return NextResponse.json({ pet: updated });
            }
        }

        // Also check pending submissions for thought bubble context
        const pendingCount = await prisma.submissionVersion.count({
            where: { studentId: userId, status: 'submitted' },
        });

        return NextResponse.json({ pet, pendingCount });
    } catch (error) {
        console.error('GET /api/pet error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST /api/pet – create a new pet
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userSession = session.user as any;
        if (userSession.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Only students can have pets' }, { status: 403 });
        }

        const userId = userSession.id;

        // Check if user already has a pet
        const existing = await prisma.pet.findUnique({ where: { userId } });
        if (existing) {
            return NextResponse.json(
                { error: 'Pet already exists' },
                { status: 400 }
            );
        }

        const { name, color } = await request.json();

        const pet = await prisma.pet.create({
            data: {
                userId,
                name: name || 'BaqyCat',
                color: color === 'GINGER' ? 'GINGER' : 'BLACK',
            },
        });

        return NextResponse.json({ pet });
    } catch (error) {
        console.error('POST /api/pet error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
