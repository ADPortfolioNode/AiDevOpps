// components/chat.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '@/lib/chatContext';
import { CodeBlock } from './CodeBlock';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setInput } = useChatContext();
  const [isSending, setIsSending] = useState(false);
  const busy = isLoading || isSending;

  useEffect(() => {
    if (!isLoading && isSending) setIsSending(false);
  }, [isLoading, isSending]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (textareaRef.current?.value || draftRef.current || input).trim();
    if (!value || busy) return;

    setIsSending(true);
    flushSync(() => setInput(value));
    draftRef.current = '';
    handleSubmit(e);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, busy, error]);

  const markdownComponents: Options['components'] = {
    // The `code` component from react-markdown receives special props like `inline`.
    // TypeScript's inference can struggle with this. Using `any` for the props
    // is a pragmatic and targeted workaround to resolve this specific build error.
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} {...props} />
      ) : (
        <code className="text-xs bg-slate-700/50 rounded px-1 py-0.5" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isLoading && !error && (
          <div className="text-center text-gray-500 mt-12">
            <p>Start a conversation with the AI Concierge</p>
            <p className="text-xs text-green-500 mt-2 font-mono">AiDevOps System Status: ONLINE.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex message-bubble ${msg.role} ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-2xl bg-gray-800 text-gray-100">
              <div className="flex gap-1 py-1 px-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-4 rounded-2xl bg-red-900/50 text-red-300 border border-red-500/30">
              <div className="font-bold mb-2 text-[10px] uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                An Error Occurred
              </div>
              <p className="text-xs mb-4 font-mono leading-relaxed bg-black/20 p-2 rounded">{error.message}</p>
              {typeof reload === 'function' && (
                <button 
                  onClick={() => { console.log('Retrying...'); reload(); }}
                  className="text-xs bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-md border border-red-500/50 transition-colors">
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onFormSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            rows={2}
            onChange={(e) => {
              draftRef.current = e.target.value;
              handleInputChange(e);
            }}
            onInput={(e) => {
              draftRef.current = e.currentTarget.value;
              const value = e.currentTarget.value;
              if (value !== input) setInput(value);
            }}
            placeholder="Ask a question..."
            className="flex-1 min-h-[44px] resize-none bg-gray-800 border border-gray-700 text-white rounded-xl px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}