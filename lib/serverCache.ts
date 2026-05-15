import { type Message, type TimelineEvent } from './types'; // Corrected import path

const conversationHistory: Message[] = [
  {
    id: 'init-chat',
    role: 'assistant',
    text: 'Welcome to AiDevOpps. I am your personal concierge, ready to help you plan, automate, and manage your work. What can I do for you today?',
    createdAt: new Date().toISOString(),
  },
];
const timelineHistory: TimelineEvent[] = [
  {
    id: 'init',
    title: 'AiDevOpps ready',
    details: 'The local server cache is initialized and awaiting prompts.',
    createdAt: new Date().toISOString()
  }
];

export function getConversationHistory() {
  return [...conversationHistory];
}

export function addConversationMessage(message: Message) {
  conversationHistory.push(message);
}

export function getTimelineEvents() {
  return [...timelineHistory].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addTimelineEvent(title: string, details: string) {
  timelineHistory.push({
    id: `${Date.now()}-${title.replace(/\s+/g, '-').toLowerCase()}`,
    title,
    details,
    createdAt: new Date().toISOString()
  });
}
