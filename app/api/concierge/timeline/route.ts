import { type NextRequest, NextResponse } from 'next/server';
import { getTimelineEvents, addTimelineEvent } from '@/lib/serverCache';

export async function GET() {
  return NextResponse.json({
    timeline: getTimelineEvents()
  });
}

export async function POST(request: NextRequest) {
  const { title, details } = await request.json();
  addTimelineEvent(title, details);
  return NextResponse.json({ success: true });
}