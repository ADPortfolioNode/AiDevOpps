'use client';

import React, { useEffect, useState } from 'react';
import { Chat } from '@/components/chat'; 
import { cn } from '@/lib/utils';
import { Timeline } from '@/components/Timeline';

interface ChatPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatPanel({ children, className }: ChatPanelProps) {
  // Fix hydration mismatch for random ID
  const [systemId, setSystemId] = useState<string>('');
  useEffect(() => {
    setSystemId(crypto.randomUUID().slice(0, 8).toUpperCase());
  }, []);

  return (
    <div className={cn("flex flex-1 flex-col md:flex-row overflow-hidden", className)}>
      {/* Left Chat Panel - Full Height */}
      <aside 
        aria-label="AI Chat" 
        className={cn(
          "flex flex-col bg-panel/50 backdrop-blur-md z-10 border-white/10",
          // Mobile: Full width, content-driven height, appears on top
          "w-full h-auto border-b", 
          // Desktop: Fixed width, full height
          "md:w-[400px] md:flex-shrink-0 md:h-screen md:border-b-0 md:border-r",
        )}
      >
        <Chat />
      </aside>

      {/* Right Area - Main content and footer */}
      <div className="flex-1 flex flex-col bg-surface overflow-y-auto">
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Meta Panel Footer */}
        <footer className="border-t border-white/10 bg-panel/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agent Activity</h3>
            <span className="text-[10px] text-blue-400 font-mono">ID: {systemId || 'LOADING...'}</span>
          </div>
          <Timeline />
        </footer>
      </div>
    </div>
  );
}