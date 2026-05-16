'use client';

import React, { useEffect, useState } from 'react';
import { Chat } from '@/components/chat'; 
import { cn } from '@/lib/utils'; // Utility for class concatenation
import { useChat } from 'ai/react';
import { ChatProvider } from '@/lib/chatContext';
import { Timeline } from '@/components/Timeline';

interface ChatPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatPanel({ children, className }: ChatPanelProps) {
  // Initialize chat at the layout level so state can be shared with dashboard actions
  const chatHelpers = useChat();

  // Fix hydration mismatch for random ID
  const [systemId, setSystemId] = useState<string>('');
  useEffect(() => {
    setSystemId(crypto.randomUUID().slice(0, 8).toUpperCase());
  }, []);

  return (
    <ChatProvider value={chatHelpers}>
      <div className={cn("flex flex-1 overflow-hidden", className)}>
        {/* Left Chat Panel - Full Height */}
        <aside aria-label="AI Chat" className="w-1/3 h-full flex flex-col border-r border-white/10">
          <Chat />
        </aside>

        {/* Right Area - Split Vertically */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Right - Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Bottom Right - Meta Panel */}
          <footer className="h-1/3 border-t border-white/10 bg-panel/20 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Metadata</h3>
              <span className="text-[10px] text-blue-400 font-mono">ID: {systemId || 'LOADING...'}</span>
            </div>
            <Timeline />
          </footer>
        </div>
      </div>
    </ChatProvider>
  );
}