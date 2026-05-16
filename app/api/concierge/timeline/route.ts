import { NextResponse } from 'next/server';
import { getTimelineEvents } from '@/lib/serverCache';

export async function GET() {
  return NextResponse.json({
    timeline: getTimelineEvents()
  });
}