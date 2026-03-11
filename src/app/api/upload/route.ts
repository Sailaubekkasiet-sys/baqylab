import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const blob = await put(file.name, file, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error: any) {
        console.error('Vercel Blob Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
