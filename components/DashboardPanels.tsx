import React from 'react';
import { getStats, getTimelineEvents, getWorkflows } from '@/lib/serverCache';
import { cn } from '@/lib/utils';
import { CollapsiblePanel } from './CollapsiblePanel';
import { Timeline } from './Timeline';

export function DashboardPanels() {
  const stats = getStats();
  const workflows = getWorkflows();
  const timelineEvents = getTimelineEvents();

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CollapsiblePanel title="Activity Timeline">
          <Timeline initialEvents={timelineEvents} />
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