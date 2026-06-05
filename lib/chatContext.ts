'use client';

import { createContext, useContext } from 'react';
import type { UseChatHelpers } from 'ai/react';

// This defines the shape of the context value provided by the `useChat` hook.
// By using `Pick` on the `UseChatHelpers` type from `ai/react`, we ensure
// our context type is always in sync with the data source, which is a robust
// and maintainable long-term solution. It includes all the properties
// needed by the chat components, including `error` and `reload`.
export type ChatContextType = Pick<
  UseChatHelpers,
  | 'messages'
  | 'input'
  | 'handleInputChange'
  | 'handleSubmit'
  | 'isLoading'
  | 'reload'
  | 'error'
  | 'setInput'
  | 'setMessages'
  | 'append'
>;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

export const ChatProvider = ChatContext.Provider;