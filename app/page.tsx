import React from 'react';
import { DashboardPanels } from '@/components/DashboardPanels';
import { QuickActions } from '@/components/QuickActions';

export default function Page() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-panel/80 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-300">Concierge Agent</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your AI Operations Partner
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Streamline your workflow by ingesting documents and delegating tasks. Use the quick actions below or start a conversation in the chat panel.
          </p>
        </div>
      </section>
      <QuickActions />
      <DashboardPanels />
    </div>
  );
}
