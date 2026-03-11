import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('URL is required', { status: 400 });
    }

    // Ensure only authenticated users can access the files
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            return new NextResponse('Server configuration error. Blob token missing.', { status: 500 });
        }

        const response = await fetch(fileUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return new NextResponse('Error fetching file', { status: response.status });
        }

        const body = response.body;
        const headers = new Headers(response.headers);
        const fileName = fileUrl.split('/').pop() || 'download';
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

        return new NextResponse(body, {
            headers,
            status: 200,
        });
    } catch (error) {
        console.error('File proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
