import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';

// Transliteration map for Cyrillic/Kazakh to Latin
const cyrillicToLatinMap: Record<string, string> = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y',
    'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'Ә': 'A', 'ә': 'a', 'Ғ': 'G', 'ғ': 'g', 'Қ': 'Q', 'қ': 'q', 'Ң': 'N', 'ң': 'n', 'Ө': 'O', 'ө': 'o', 'Ұ': 'U',
    'ұ': 'u', 'Ү': 'U', 'ү': 'u', 'Һ': 'H', 'һ': 'h', 'І': 'I', 'і': 'i'
};

function transliterate(text: string): string {
    return text.split('').map(char => cyrillicToLatinMap[char] || char).join('').replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (role !== 'TEACHER') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const classId = formData.get('classId') as string;

        if (!file || !classId) {
            return NextResponse.json({ error: 'File and classId are required' }, { status: 400 });
        }

        // Verify teacher owns the class
        const cls = await prisma.class.findUnique({
            where: { id: classId },
            select: { teacherId: true },
        });

        if (!cls || cls.teacherId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Upload to Vercel Blob
        const userName = (session.user as any).name || 'Unknown';
        const latinName = transliterate(userName);
        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        let baseName = originalName;
        let ext = '';

        if (lastDotIndex !== -1) {
            baseName = originalName.substring(0, lastDotIndex);
            ext = originalName.substring(lastDotIndex);
        }

        baseName = transliterate(baseName);
        const newFileName = `materials/${baseName}_${latinName}${ext}`;

        const blob = await put(newFileName, file, {
            access: 'private',
            addRandomSuffix: true,
        });

        // Save material record in DB
        const material = await prisma.material.create({
            data: {
                classId,
                uploaderId: userId,
                fileName: originalName,
                fileSize: file.size,
                filePath: blob.url,
                mimeType: file.type || 'application/octet-stream',
            },
        });

        return NextResponse.json({ material }, { status: 201 });
    } catch (error) {
        console.error('POST /api/materials error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
