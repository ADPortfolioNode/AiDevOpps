'use client';

import React, { useEffect, useState } from 'react';
import { Chat } from '@/components/chat'; 
import { cn } from '@/lib/utils'; // Utility for class concatenation
import { useChat } from 'ai/react';
import { ChatProvider } from '@/lib/chatContext';
import { Timeline } from '@/components/Timeline';
import { useModelContext } from '@/lib/modelContext';

interface ChatPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatPanel({ children, className }: ChatPanelProps) {
  const { selectedModel } = useModelContext();

  // Initialize chat at the layout level so state can be shared with dashboard actions
  const chatHelpers = useChat({
    body: {
      model: selectedModel,
    },
    initialMessages: [
      {
        id: 'welcome-message',
        role: 'assistant',
        content: 'AiDevOpps System Status: ONLINE. All services operational. Welcome! How can I help you today?',
      }
    ]
  });

  // Fix hydration mismatch for random ID
  const [systemId, setSystemId] = useState<string>('');
  useEffect(() => {
    setSystemId(crypto.randomUUID().slice(0, 8).toUpperCase());
  }, []);

  return (
    <ChatProvider value={chatHelpers}>
      <div className={cn("flex flex-col flex-1 md:flex-row items-start panel-transition", className)}>
        {/* Left Chat Panel - Full Height */}
        <aside 
          aria-label="AI Chat" 
          className={cn(
            "flex flex-col bg-panel/50 backdrop-blur-md z-10 panel-transition border-white/10 overflow-hidden",
            // Mobile (default): Row 2, spans full width, content-driven height
            "w-full h-auto border-b", 
            // Tablet (md)
            "md:w-[35%] md:max-w-md md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r",
            // Laptop (lg)
            "lg:w-[30%]",
            // Desktop (xl)
            "xl:w-[25%]",
            // Ultra-wide (2xl)
            "2xl:w-[20%]"
          )}
        >
          <Chat />
        </aside>

        {/* Right Area - Split Vertically */}
        <div className="flex-1 flex flex-col bg-surface panel-transition">
          {/* Top Right - Main Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </main>

          {/* Bottom Right - Meta Panel */}
          <footer className="border-t border-white/10 bg-panel/20 p-6 panel-transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agent Activity</h3>
              <span className="text-[10px] text-blue-400 font-mono">ID: {systemId || 'LOADING...'}</span>
            </div>
            <Timeline />
          </footer>
        </div>
      </div>
    </ChatProvider>
  );
}