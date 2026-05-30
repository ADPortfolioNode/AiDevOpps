// components/chat.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '@/lib/chatContext';
import { CodeBlock } from './CodeBlock';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

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
            Start a conversation with the AI Concierge
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] p-3 rounded-2xl bg-gray-800 text-gray-100">
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
            <div className="max-w-[85%] p-4 rounded-2xl bg-red-900/50 text-red-300 border border-red-500/30">
              <div className="font-bold mb-1 text-[10px] uppercase tracking-wider text-red-400">
                An Error Occurred
              </div>
              <p className="text-xs mb-3 font-mono">{error.message}</p>
              {reload && (
                <button 
                  onClick={() => reload()} 
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask the Concierge anything..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-5 py-3 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}