'use client';

import React, { createContext, useContext } from 'react';
import { type Message as AIMessage } from 'ai/react';

interface ChatContextType {
  append: (message: AIMessage) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

export function ChatProvider({ children, value }: { children: React.ReactNode; value: ChatContextType }) {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}