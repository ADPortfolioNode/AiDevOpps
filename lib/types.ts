export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  details: string;
  timestamp: string;
}