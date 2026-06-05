'use client';

import React, { useEffect, useState, useRef } from 'react';
import { formatTime } from '@/lib/utils';
import type { TimelineEvent } from '@/lib/types';

interface TimelineProps {
  initialEvents?: TimelineEvent[];
}

function TimelineSkeletonItem() {
  return (
    <div className="relative pl-4 border-l border-slate-700/30 py-1">
      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-700" />
      <div className="animate-pulse flex flex-col gap-2 py-1">
        <div className="flex justify-between items-center">
          <div className="h-3 w-2/5 bg-slate-700 rounded-md" />
          <div className="h-2 w-1/6 bg-slate-700 rounded-md" />
        </div>
        <div className="h-3 w-full bg-slate-700 rounded-md" />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      <TimelineSkeletonItem />
      <TimelineSkeletonItem />
      <TimelineSkeletonItem />
    </div>
  );
}

export function Timeline({ initialEvents = [] }: TimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [isPolling, setIsPolling] = useState(initialEvents.length === 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    let isMounted = true;

    async function fetchTimeline() {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const res = await fetch('/api/concierge/timeline');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json();
        if (isMounted) {
          setEvents(data?.events || []);
        }
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setTimeout(() => {
          if (isMounted) {
            isFetching.current = false;
            setIsPolling(false);
          }
        }, 300);
      }
    }

    const shouldPollInitially = events.length === 0;
    if (shouldPollInitially) setIsPolling(true);
    fetchTimeline(); // Initial fetch on mount

    // Polling for updates every 5 seconds to keep metadata fresh
    const interval = setInterval(fetchTimeline, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isClient, events.length]); // Re-run when hydration status or event count changes

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [events]);

  return (
    <div ref={containerRef} className="space-y-4 max-h-48 overflow-y-auto pr-2">
      {isPolling && events.length === 0 ? (
        <TimelineSkeleton />
      ) : events.length === 0 ? (
        <div className="text-sm text-slate-500 italic">No activity recorded yet.</div>
      ) : (
        <>
          {[...events].reverse().map((event) => (
            <div key={event.id} className="relative pl-4 border-l border-blue-500/30 py-1 animate-in slide-in-from-left-2 duration-300">
              <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-semibold text-slate-200">{event.title}</span>
                <span className="text-[10px] text-slate-500">{isClient ? formatTime(event.timestamp) : ''}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.details}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}