// lib/types.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date | string; // Can be Date on server, string on client
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  details: string;
}