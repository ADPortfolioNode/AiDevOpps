import { NextResponse } from 'next/server';
import { getTimelineEvents } from '@/lib/serverCache';
import { withCorsInit } from '@/lib/cors';

export async function GET() {
  const timeline = getTimelineEvents();
  return NextResponse.json({ timeline }, withCorsInit());
}