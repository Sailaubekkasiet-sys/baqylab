import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Выполняем простой запрос к базе данных для предотвращения авто-паузы
    await prisma.user.count();
    
    return NextResponse.json(
      { success: true, message: 'Database is active' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Keep-alive cron error:', error);
    return NextResponse.json(
      { success: false, message: 'Database query failed' },
      { status: 500 }
    );
  }
}
