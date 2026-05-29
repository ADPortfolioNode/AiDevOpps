'use client';

import React from 'react';
import { QUICK_ACTIONS, cn } from '@/lib/utils';
import { useChatContext } from '@/lib/chatContext';

export function QuickActions() {
  const { setInput } = useChatContext();

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-white/90">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.title}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-3xl border bg-slate-950/40 p-6 shadow-lg shadow-black/10 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-2xl hover:-translate-y-1',
              action.color
            )}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{action.icon}</span>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{action.description}</p>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end rounded-b-3xl bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="space-y-2">
                {action.prompts.map((prompt) => (
                  <div
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="block w-full rounded-md bg-white/5 p-2 text-left text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}