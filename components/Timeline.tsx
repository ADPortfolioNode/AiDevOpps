'use client';

import React, { useEffect, useState } from 'react';
import { formatTime } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  timestamp: string;
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/concierge/timeline');
        const data = await res.json();
        setEvents(data.timeline || []);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      }
    }
    fetchTimeline();
    // Polling for updates every 5 seconds to keep metadata fresh
    const interval = setInterval(fetchTimeline, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-sm text-slate-500 italic">No activity recorded yet.</div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="relative pl-4 border-l border-blue-500/30 py-1 animate-in slide-in-from-left-2 duration-300">
            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-slate-200">{event.title}</span>
              <span className="text-[10px] text-slate-500">{formatTime(event.timestamp)}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.details}</p>
          </div>
        ))
      )}
    </div>
  );
}