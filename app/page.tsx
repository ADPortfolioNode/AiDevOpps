'use client';

import React, { useEffect, useState } from 'react';
import { useChatContext } from '../lib/chatContext';
import { formatTime, QUICK_ACTIONS } from '../lib/utils';
import { type TimelineEvent } from '../lib/types';

const iconMap: { [key: string]: React.ReactNode } = {
  '🎯': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  '🤖': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8V8H12Z" /><rect x="4" y="12" width="16" height="8" rx="2" /><path d="M6 12v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M12 18v-2" /></svg>,
  '🗺️': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  '🗂️': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>,
};

export default function HomePage() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const { append } = useChatContext(); // Get append from context

  // The chat state and logic are now handled in app/layout.tsx
  // We only need to fetch timeline events here.
  useEffect(() => {
    async function loadTimeline() {
      const response = await fetch('/api/concierge/timeline'); // Assuming this endpoint exists
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline ?? []);
      }
    }
    loadTimeline();
  }, []);

  return (
    <div className="grid flex-1 grid-rows-[1fr_auto] overflow-hidden"> {/* Use grid for two rows */}
      {/* Main Content Area (Top Right) */}
      <main className="overflow-y-auto border-b border-white/10 px-6 py-8 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="space-y-6">
              <div className="badge">Welcome back</div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-white sm:text-5xl">AiDevOpps is ready to help.</h1>
                <p className="max-w-2xl text-slate-400">
                  Start with one of the quick actions or open the AI chat panel to let the system plan, automate, and manage your work.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {QUICK_ACTIONS.map((item) => {
                  const handleActionClick = (prompt: string) => {
                    append({
                      role: 'user',
                      content: prompt,
                    });
                  };
                  return (
                    <article key={item.title} className={`action-card border ${item.color}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-400">
                          {iconMap[item.icon]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-3">
                        {item.prompts.map((prompt) => (
                          <button
                            key={prompt}
                            className="prompt-chip text-left"
                            onClick={() => handleActionClick(prompt)}
                            type="button"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
          </section>
        </div>
      </main>
      
      {/* Meta Area (Bottom Right) */}
      <aside role="region" aria-label="Metadata" className="overflow-y-auto p-6 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Timeline</div>
            <div className="grid gap-3">
              {timeline.slice(0, 3).map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="font-semibold text-slate-100">{event.title}</div>
                  <p className="mt-1 text-sm text-slate-400">{event.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}