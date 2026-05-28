// lib/types.ts

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  timestamp: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'paused';
  lastRun: string;
}