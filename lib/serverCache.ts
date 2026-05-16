import { Message, TimelineEvent } from './types';

const conversationHistory: Message[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    text: 'Welcome to AiDevOpps. How can I help you today?',
    createdAt: new Date().toISOString()
  }
];
const timelineEvents: TimelineEvent[] = [
  {
    id: 'init-1',
    title: 'System Initialized',
    details: 'AiDevOpps core kernel is active and listening.',
    timestamp: new Date().toISOString()
  }
];

export function getConversationHistory() {
  return conversationHistory;
}

export function addConversationMessage(message: Message) {
  conversationHistory.push(message);
}

export function getTimelineEvents() {
  return timelineEvents;
}

export function addTimelineEvent(title: string, details: string) {
  timelineEvents.unshift({
    id: Math.random().toString(36).substring(7),
    title,
    details,
    timestamp: new Date().toISOString()
  });
}