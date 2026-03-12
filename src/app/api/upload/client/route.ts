import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as HandleUploadBody;

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // User is already authenticated above
                return {
                    addRandomSuffix: true,
                    maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max
                };
            },
            onUploadCompleted: async ({ blob }) => {
                // Optional: could save to DB here, but we do it client-side after
                console.log('Client upload completed:', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 400 },
        );
    }
}
