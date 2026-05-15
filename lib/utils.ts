export const QUICK_ACTIONS = [
  {
    title: 'Achieve Your Goals',
    description: 'Set and track your objectives.',
    icon: '🎯',
    color: 'border-blue-500',
    prompts: [
      'Create a 4-week goal to migrate our REST API to GraphQL.',
      'Break down the "Q3 Marketing Campaign" into smaller tasks.',
    ],
  },
  {
    title: 'Automate Your Work',
    description: 'Find repetitive tasks to automate.',
    icon: '🤖',
    color: 'border-green-500',
    prompts: [
      'Draft a script to auto-reply to common customer support questions.',
      'Can you automate the weekly report generation?',
    ],
  },
  {
    title: 'Plan Your Strategy',
    description: 'Brainstorm and outline strategies.',
    icon: '🗺️',
    color: 'border-purple-500',
    prompts: [
      'Outline a go-to-market strategy for a new SaaS product.',
      'What are the key pillars of a successful content marketing strategy?',
    ],
  },
  {
    title: 'Manage Your Workspace',
    description: 'Organize and manage your projects.',
    icon: '🗂️',
    color: 'border-yellow-500',
    prompts: [
      'Summarize the key decisions from the "Project Phoenix" documents.',
      'What are the next steps for the "Website Redesign" project?',
    ],
  },
];

export function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}