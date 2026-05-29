'use client';

import React, { useEffect, useState, useRef } from 'react';
import { formatTime } from '@/lib/utils';
import type { TimelineEvent } from '@/lib/types';

interface TimelineProps {
  initialEvents?: TimelineEvent[];
}

export function Timeline({ initialEvents = [] }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/concierge/timeline');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json();
        setEvents(data.timeline || []);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      }
    }

    // If no initial events were provided from the server, fetch them immediately.
    if (initialEvents.length === 0) {
      fetchTimeline();
    }

    // Polling for updates every 5 seconds to keep metadata fresh
    const interval = setInterval(fetchTimeline, 5000);
    return () => clearInterval(interval);
  }, [initialEvents.length]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [events]);

  return (
    <div ref={containerRef} className="space-y-4 max-h-48 overflow-y-auto pr-2">
      {events.length === 0 ? (
        <div className="text-sm text-slate-500 italic">No activity recorded yet.</div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="relative pl-4 border-l border-blue-500/30 py-1 animate-in slide-in-from-left-2 duration-300">
            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-slate-200">{event.title}</span>
              <span className="text-[10px] text-slate-500">{isClient ? formatTime(event.timestamp) : ''}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.details}</p>
          </div>
        ))
      )}
    </div>
  );
}