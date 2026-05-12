'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSavedMessages, saveMessages } from '@/lib/indexedDb';
import type { Message as StoredMessage } from '@/lib/indexedDb';

type Message = StoredMessage;

type TimelineEvent = {
  id: string;
  title: string;
  details: string;
  createdAt: string;
};

const QUICK_ACTIONS = [
  {
    icon: '🎯',
    title: 'Achieve Your Goals',
    description: 'Turn ambitions into results with plans, tasks, and AI guidance.',
    prompts: [
      'Create a 4-week goal to migrate our REST API to GraphQL.',
      'I want to reduce page load time by 40% — plan it out.',
      'Set weekly goals for improving test coverage from 60% to 90%.'
    ],
    color: 'bg-violet-500/15 border-violet-500/20 text-violet-200'
  },
  {
    icon: '⚡',
    title: 'Automate Your Work',
    description: 'Run background tasks without lifting a finger and track progress visually.',
    prompts: [
      'Analyse a CSV file and summarise the key trends.',
      'Generate a script to parse logs and extract error counts.',
      'Read a spec and list all missing edge cases.'
    ],
    color: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-200'
  },
  {
    icon: '🗺️',
    title: 'Plan Your Strategy',
    description: 'Use AI for SWOT, OKRs, roadmaps and strategic decision support.',
    prompts: [
      'Write 3 OKRs for our product team for Q3.',
      'Run a SWOT analysis for a developer tools startup.',
      'Build a 6-month roadmap for a data analytics platform.'
    ],
    color: 'bg-sky-500/15 border-sky-500/20 text-sky-200'
  },
  {
    icon: '📁',
    title: 'Manage Your Workspace',
    description: 'Keep files, context and AI notes together in a modern workspace hub.',
    prompts: [
      "Summarise the authentication requirements from a spec.",
      'Attach a financial model CSV to the planning project.',
      'Transcribe an audio file and summarise the result.'
    ],
    color: 'bg-amber-500/15 border-amber-500/20 text-amber-200'
  }
];

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [status, setStatus] = useState('Ready to chat');
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false); // New state for mobile chat visibility
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const saved = await getSavedMessages();
      setMessages(saved.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      const response = await fetch('/api/concierge/timeline');
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline ?? []);
      }
    }

    load();
  }, []);

  const handlePromptClick = async (prompt: string) => {
    setLoading(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
      createdAt: new Date().toISOString()
    };

    const current = [...messages, userMessage];
    setMessages(current);
    await saveMessages(current);

    try {
      const response = await fetch('/api/concierge/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (response.ok) {
        const nextMessages = data.conversation ?? [...current, data.message];
        setMessages(nextMessages);
        await saveMessages(nextMessages);
        setStatus('AI response received');
      } else {
        setStatus(data.error ?? 'Conversation request failed');
      }
    } catch (error) {
      console.error(error);
      setStatus('Unable to contact Concierge API');
    }

    setLoading(false);
  };

  const latestMessage = messages[messages.length - 1];
  const selectedPrompt = latestMessage?.role === 'user' ? latestMessage.text : 'Click a prompt to start the chat';

  const leftCards = useMemo(
    () => QUICK_ACTIONS.map((item) => {
      const handleActionClick = (prompt: string) => {
        handlePromptClick(prompt);
        // On mobile, open the chat panel when a prompt is clicked
        if (window.innerWidth < 1024) { // Assuming 'lg' breakpoint is 1024px
          setIsChatPanelOpen(true);
        }
      };
      return (
      <article key={item.title} className={`action-card border ${item.color}`}>
        <div className="flex items-start gap-4">
          <div className="rounded-3xl bg-slate-950/80 p-3 text-xl">{item.icon}</div>
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
  }),
    [messages, setIsChatPanelOpen]
  );

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-14">
      {/* Mobile-only chat toggle button */}
      <button
        className="fixed bottom-4 right-4 z-50 rounded-full bg-accent p-4 text-white shadow-lg lg:hidden"
        onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
      >
        {isChatPanelOpen ? '✕' : '💬'}
      </button>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="panel grid gap-8 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="badge">Welcome back</div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">AiDevOpps is ready to help.</h1>
              <p className="max-w-2xl text-slate-400">
                Start with one of the quick actions or open the AI chat panel to let the system plan, automate, and manage your work.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {QUICK_ACTIONS.slice(0, 2).map((item) => (
                <div key={item.title} className="action-card border border-white/10 bg-slate-900/80">
                  <div className="flex items-center gap-4">
                    <div className="rounded-3xl bg-slate-950/80 p-3 text-xl">{item.icon}</div>
                    <div>
                      <h2 className="font-semibold text-slate-100">{item.title}</h2>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {QUICK_ACTIONS.slice(2).map((item) => (
                <div key={item.title} className="action-card border border-white/10 bg-slate-900/80">
                  <div className="flex items-center gap-4">
                    <div className="rounded-3xl bg-slate-950/80 p-3 text-xl">{item.icon}</div>
                    <div>
                      <h2 className="font-semibold text-slate-100">{item.title}</h2>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Conditional rendering and styling for mobile chat panel */}
          <aside
            className={`panel sticky top-8 flex min-h-[520px] flex-col gap-5
                       lg:block ${isChatPanelOpen ? 'fixed inset-0 z-40 bg-slate-950 p-6' : 'hidden'}`}
          >
            <div>
              <div className="badge">AI Chat</div>
              <h2 className="mt-4 text-2xl font-semibold text-white">Right-side assistant</h2>
              <p className="mt-2 text-sm text-slate-400">Click any prompt to see the chat open and retrieve the AI response.</p>
            </div>
            <div className="space-y-4 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected prompt</div>
              <p className="text-sm text-slate-200">{selectedPrompt}</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="text-slate-400">No conversation yet. Use a quick action prompt to begin.</div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`message-bubble ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
                      <span>{message.role === 'assistant' ? 'AI' : 'You'}</span>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">{message.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2 rounded-[24px] border border-white/10 bg-slate-900/90 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Conversation status</span>
                <span className="text-slate-100">{loading ? 'Waiting for AI...' : status}</span>
              </div>
              <div className="grid gap-3">
                {QUICK_ACTIONS.flatMap((item) => item.prompts).slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    className="prompt-chip"
                    onClick={() => handlePromptClick(prompt)}
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Timeline</div>
              <div className="grid gap-3">
                {timeline.slice(0, 3).map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="font-semibold text-slate-100">{event.title}</div>
                    <p className="mt-1 text-slate-400 text-sm">{event.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
