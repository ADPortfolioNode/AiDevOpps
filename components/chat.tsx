'use client';

import { useChatContext } from '@/lib/chatContext';
import { AutoGrowingTextarea } from '@/components/AutoGrowingTextarea';
import { Button } from '@/components/button';
import React, { useEffect, useRef } from 'react';

export function Chat() {
  // Use the shared state from ChatPanel so dashboard actions work
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-panel transition-all duration-300 overflow-hidden">
      {/* Messages Area - Fills space */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-full">
          {messages.map(m => (
            <div 
              key={m.id} 
              suppressHydrationWarning
              className={`message-bubble ${m.role} flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
              }`}>
                <div className="font-bold mb-1 text-[10px] uppercase tracking-wider opacity-50">
                  {m.role === 'user' ? 'You' : 'AiDevOpps'}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-slate-800 text-slate-100 rounded-tl-none border border-white/5">
                <div className="flex gap-1 py-1 px-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="p-4 border-t border-white/10 bg-panel/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-slate-900/50 border border-white/10 rounded-xl p-2 focus-within:border-blue-500/50 transition-colors">
          <AutoGrowingTextarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question or type a command..."
            className="flex-1 px-2 py-1 min-h-[40px] text-slate-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = (e.target as HTMLTextAreaElement).form;
                if (form) form.requestSubmit();
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg h-10 px-4"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}