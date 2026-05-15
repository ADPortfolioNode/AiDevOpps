'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useChat, type Message as AIMessage } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AutoGrowingTextarea } from './AutoGrowingTextarea'; // Relative import within components
import { getSavedMessages, saveMessages } from '../lib/indexedDb'; // Relative import to lib
import { type StoredMessage } from '../lib/types'; // Relative import to lib
import { formatTime } from '../lib/utils'; // Relative import to lib
import { ChatProvider } from '../lib/chatContext'; // Relative import to lib

interface ChatPanelProps {
  children: React.ReactNode;
}

export function ChatPanel({ children }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, setInput } = useChat({
    api: '/api/concierge/conversation',
  });

  // Load initial messages from IndexedDB
  useEffect(() => {
    async function loadInitialMessages() {
      const saved = await getSavedMessages();
      if (saved.length > 0) {
        const initialMessages: AIMessage[] = saved
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.text,
            createdAt: new Date(msg.createdAt),
          }));
        setMessages(initialMessages);
      } else {
        // If no saved messages, fetch initial conversation from API
        const convResponse = await fetch('/api/concierge/conversation');
        if (convResponse.ok) {
          const data = await convResponse.json();
          const serverMessages: StoredMessage[] = data.conversation ?? [];
          setMessages(
            serverMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.text,
              createdAt: new Date(msg.createdAt),
            }))
          );
          await saveMessages(serverMessages);
        }
      }
    }
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages to IndexedDB whenever the conversation changes and is not loading.
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const storableMessages: StoredMessage[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        text: msg.content,
        createdAt: (msg.createdAt ?? new Date()).toISOString(),
      }));
      saveMessages(storableMessages);
    }
  }, [messages, isLoading]);

  // Scroll to the bottom of the chat view whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const chatContextValue = useMemo(() => ({ append, isLoading }), [append, isLoading]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Column: AI Chat Panel */}
      <aside
        role="region"
        aria-label="AI Chat"
        className="flex w-[420px] flex-col border-r border-white/10 bg-panel p-6"
      >
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`message-bubble ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <span>{message.role === 'assistant' ? 'AI' : 'You'}</span>
                <span>{message.createdAt ? formatTime(message.createdAt.toISOString()) : ''}</span>
              </div>
              {message.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-invert mt-2 text-sm leading-6 text-slate-100" remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-100">{message.content}</p>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="message-bubble assistant">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <span>AI</span>
              </div>
              {/* Simple "thinking" animation */}
              <p className="mt-2 animate-pulse text-sm leading-6 text-slate-100">Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-auto space-y-4 pt-4">
          <AutoGrowingTextarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question or type a command..."
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm"
            disabled={isLoading}
          />
        </form>
      </aside>
      {/* Right Column: Main Content and Meta */}
      <ChatProvider value={chatContextValue}>
        {children}
      </ChatProvider>
    </div>
  );
}