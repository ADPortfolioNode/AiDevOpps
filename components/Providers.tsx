'use client';

import React from 'react';
import { ChatProvider } from '@/lib/chatContext';
import { ModelProvider, useModelContext } from '@/lib/modelContext';
import { useChat } from 'ai/react';
import type { Message } from '@/lib/types';

interface ChatProviderWrapperProps {
  children: React.ReactNode;
  initialMessages: Message[];
}

function ChatProviderWrapper({ children, initialMessages }: ChatProviderWrapperProps) {
  const { selectedModel } = useModelContext();

  // Dates are serialized as strings from Server Components.
  // We need to convert them back to Date objects for the `useChat` hook.
  const normalizedMessages = (initialMessages || []).map((message: any) => ({
    ...message,
    createdAt: message.createdAt ? new Date(message.createdAt) : undefined,
  }));

  const chatHelpers = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
    initialMessages: normalizedMessages,
  });

  return <ChatProvider value={chatHelpers}>{children}</ChatProvider>;
}

export function Providers({ children, initialMessages }: { children: React.ReactNode, initialMessages: Message[] }) {
  return (
    <ModelProvider>
      <ChatProviderWrapper initialMessages={initialMessages}>{children}</ChatProviderWrapper>
    </ModelProvider>
  );
}