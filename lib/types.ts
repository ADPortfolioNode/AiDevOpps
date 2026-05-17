export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  timestamp: string;
}