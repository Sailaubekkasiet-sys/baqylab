import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// A simple transliteration map for Cyrillic/Kazakh to Latin
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
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get user's name in Latin
        const userName = (session.user as any).name || 'Unknown';
        const latinName = transliterate(userName);

        // Format filename: originalName_UserName.ext
        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        let baseName = originalName;
        let ext = '';

        if (lastDotIndex !== -1) {
            baseName = originalName.substring(0, lastDotIndex);
            ext = originalName.substring(lastDotIndex);
        }

        // Sanitize base name just in case
        baseName = transliterate(baseName);
        const newFileName = `${baseName}_${latinName}${ext}`;

        const blob = await put(newFileName, file, {
            access: 'private',
            addRandomSuffix: true, // Forces uniqueness even if two files have the exact same generated name
        });

        return NextResponse.json(blob);
    } catch (error: any) {
        console.error('Vercel Blob Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
