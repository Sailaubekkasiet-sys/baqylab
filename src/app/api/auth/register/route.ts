import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'auth.err.allFieldsRequired' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'auth.err.passwordLength' }, { status: 400 });
        }

        if (!['TEACHER', 'STUDENT'].includes(role)) {
            return NextResponse.json({ error: 'auth.err.invalidRole' }, { status: 400 });
        }

        // Check existing user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'auth.err.emailExistsShort' }, { status: 400 });
        }

        // Create user
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
            },
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'api.err.internalServer' }, { status: 500 });
    }
}
