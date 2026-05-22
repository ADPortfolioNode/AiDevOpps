'use client';

import React from 'react';
import { ChatProvider } from '@/lib/chatContext';
import { ModelProvider, useModelContext } from '@/lib/modelContext';
import { useChat } from 'ai/react';

function ChatProviderWrapper({ children }: { children: React.ReactNode }) {
  const { selectedModel } = useModelContext();
  const chatHelpers = useChat({
    body: { model: selectedModel },
    initialMessages: [
      { id: 'welcome', role: 'assistant', content: 'AiDevOpps Status: ONLINE. Welcome!' }
    ]
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