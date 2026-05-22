import { Message, TimelineEvent } from './types';

const conversationHistory: Message[] = [
  {
    id: 'welcome-message', 
    role: 'assistant',
    content: 'AiDevOps System Status: ONLINE. All services operational. Welcome! How can I help you today?',
    createdAt: new Date().toISOString()
  }
];
const timelineEvents: TimelineEvent[] = [
  {
    id: 'init-1',
    title: 'System Initialized', 
    details: 'AiDevOps core kernel is active and listening.',
    timestamp: new Date().toISOString()
  }
];

const workflows = [
  { id: 'wf-1', name: 'Daily Standup Summary', status: 'active', lastRun: new Date().toISOString() },
  { id: 'wf-2', name: 'GitHub Issue Triage', status: 'paused', lastRun: new Date().toISOString() },
];

const stats = {
  tasks: 124,
  hitRate: 94.2,
  cost: 0.86
};

export function getStats() { return stats; }
export function getWorkflows() { return workflows; }

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