import React from 'react';

export default function Page() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-panel/80 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-300">AiDevOps</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            AI Operations Management, built for speed.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Use the document upload button to ingest knowledge, then ask the concierge for summaries, insights, and task automation. The right-hand chat panel keeps the conversation and agent activity visible as you work.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-semibold text-white">Upload documents</h2>
          <p className="mt-3 text-sm text-slate-400">Ingest local PDFs, text files, or URLs into the knowledge base for retrieval-augmented answers.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-semibold text-white">Start a conversation</h2>
          <p className="mt-3 text-sm text-slate-400">Ask the Concierge agent anything and it will use the current context, tools, and RAG data to answer.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-semibold text-white">Monitor activity</h2>
          <p className="mt-3 text-sm text-slate-400">Track agent work and conversation history in the activity timeline below.</p>
        </div>
      </section>
    </div>
  );
}
