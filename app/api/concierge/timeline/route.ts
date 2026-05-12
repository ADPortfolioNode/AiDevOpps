import { NextResponse } from 'next/server';
import { getTimelineEvents, addTimelineEvent } from '@/lib/serverCache';
import { withCorsInit } from '@/lib/cors';
import type { NextRequest } from 'next/server';

export async function OPTIONS() {
  return NextResponse.json(null, withCorsInit({ status: 204 }));
}

export async function GET() {
  return NextResponse.json({ timeline: getTimelineEvents() }, withCorsInit());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = String(body.title || 'Timeline update');
  const details = String(body.details || 'A timeline event was recorded.');
  addTimelineEvent(title, details);
  return NextResponse.json({ timeline: getTimelineEvents() }, withCorsInit());
}
