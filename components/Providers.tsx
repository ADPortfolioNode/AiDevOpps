'use client';

import React from 'react';
import { ChatProvider } from '@/lib/chatContext';
import { ModelProvider, useModelContext } from '@/lib/modelContext';
import { getConversationHistory } from '@/lib/serverCache';
import { useChat } from 'ai/react';

function ChatProviderWrapper({ children }: { children: React.ReactNode }) {
  const { selectedModel } = useModelContext();

  // The `getConversationHistory` might return serialized data where `createdAt` is a string.
  // We need to convert it back to a Date object for the `useChat` hook.
  const initialMessages = getConversationHistory().map(message => ({
    ...message,
    createdAt: new Date(message.createdAt),
  }));

  const chatHelpers = useChat({
    body: { model: selectedModel },
    initialMessages: initialMessages,
  });

  return <ChatProvider value={chatHelpers}>{children}</ChatProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <ChatProviderWrapper>{children}</ChatProviderWrapper>
    </ModelProvider>
  );
}