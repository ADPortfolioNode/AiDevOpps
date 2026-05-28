'use client';

import React, { useState } from 'react';
import { cn, formatTime } from '@/lib/utils';
import type { TimelineEvent, Workflow } from '@/lib/types';

interface Stats {
  tasks: number;
  hitRate: number;
  cost: number;
}

interface DashboardPanelsProps {
  stats: Stats;
  workflows: Workflow[];
  timelineEvents: TimelineEvent[];
}

function CollapsiblePanel({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/80 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className={`transform text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="mt-4 animate-in fade-in-50">{children}</div>}
    </div>
  );
}

export function DashboardPanels({ stats, workflows, timelineEvents }: DashboardPanelsProps) {
  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CollapsiblePanel title="Activity Timeline">
          <div className="space-y-4">
            {timelineEvents.map(event => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="w-16 shrink-0 text-right text-xs text-slate-500">{formatTime(event.timestamp)}</div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{event.title}</p>
                  <p className="text-xs text-slate-400">{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsiblePanel>
      </div>
      <div className="space-y-8">
        <CollapsiblePanel title="System Stats">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-3xl font-semibold text-blue-400">{stats.tasks}</p><p className="text-xs text-slate-400">Tasks</p></div>
                <div><p className="text-3xl font-semibold text-green-400">{stats.hitRate}%</p><p className="text-xs text-slate-400">Hit Rate</p></div>
                <div><p className="text-3xl font-semibold text-yellow-400">${stats.cost.toFixed(2)}</p><p className="text-xs text-slate-400">Cost</p></div>
            </div>
        </CollapsiblePanel>
        <CollapsiblePanel title="Automated Workflows">
            <div className="space-y-3">
                {workflows.map(wf => (
                    <div key={wf.id} className="flex items-center justify-between text-sm">
                        <p className="text-slate-300">{wf.name}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", wf.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400')}>{wf.status}</span>
                    </div>
                ))}
            </div>
        </CollapsiblePanel>
      </div>
    </section>
  );
}