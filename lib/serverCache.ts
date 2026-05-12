export type Role = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  role: Role;
  text: string;
  createdAt: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  details: string;
  createdAt: string;
};

const conversationHistory: Message[] = [];
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
