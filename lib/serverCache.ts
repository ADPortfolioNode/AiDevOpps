// lib/serverCache.ts
import type { Message, TimelineEvent } from './types';

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface Stats {
  tasks: number;
  hitRate: number;
  cost: number;
}

// Simple in-memory cache for demonstration purposes.
// In a real multi-user production environment, this should be replaced with a
// more robust, user-specific storage solution like Redis, a database, or a managed cache service.
let timeline: TimelineEvent[] = [];
let conversationHistory: Message[] = [
  {
    id: 'initial-message',
    role: 'assistant',
    content: 'AiDevOps System Status: ONLINE. All systems operational. How can I assist you today?',
    createdAt: new Date(),
  }
];

const mockStats: Stats = {
  tasks: 12,
  hitRate: 94,
  cost: 1.23,
};

const mockWorkflows: Workflow[] = [
  { id: 'wf-1', name: 'CI/CD Build Analysis', status: 'active' },
  { id: 'wf-2', name: 'Automated Code Refactoring', status: 'active' },
  { id: 'wf-3', name: 'Security Vulnerability Scan', status: 'inactive' },
];

export function addTimelineEvent(title: string, details: string) {
  const event: TimelineEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    title,
    details,
  };
  // Keep the timeline from growing indefinitely
  if (timeline.length > 50) {
    timeline.shift();
  }
  timeline.push(event);
}

export function getTimelineEvents(): TimelineEvent[] {
  // Return a copy to prevent mutation
  return [...timeline];
}

export function clearTimeline() {
  timeline = [];
}

export function addConversationMessage(message: Message) {
  // Ensure createdAt is a Date object for consistency in the server cache.
  const messageWithDate = {
    ...message,
    createdAt: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
  };

  // Keep the history from growing indefinitely
  if (conversationHistory.length > 100) {
    conversationHistory.shift();
  }
  conversationHistory.push(messageWithDate);
}

export function getConversationHistory(): Message[] {
  return [...conversationHistory];
}

export function getStats(): Stats {
  return mockStats;
}

export function getWorkflows(): Workflow[] {
  return mockWorkflows;
}