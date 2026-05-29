'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({ title, children, defaultOpen = false }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/80 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className={`transform text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
          ▼
        </span>
      </button>
      <div className={cn('grid transition-all duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}