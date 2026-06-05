import { NextResponse } from 'next/server';
import { getTimelineEvents, clearTimeline } from '@/lib/serverCache';

/** Timeline shape expected by Playwright tests and legacy clients. */
function serializeEvents() {
  return getTimelineEvents().map((event) => ({
    ...event,
    type: event.title,
    message: event.details,
  }));
}

export async function GET() {
  try {
    const events = serializeEvents();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('[Timeline API] Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearTimeline();
    return NextResponse.json({ message: 'Timeline cleared' });
  } catch (error) {
    console.error('[Timeline API] Error clearing events:', error);
    return NextResponse.json({ error: 'Failed to clear timeline events' }, { status: 500 });
  }
}
