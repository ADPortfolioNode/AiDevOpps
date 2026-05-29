import { NextResponse } from 'next/server';
import { getTimelineEvents } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timeline = getTimelineEvents();
    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('[Timeline API Error]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch timeline events.' }),
      { status: 500 }
    );
  }
}