export type Role = 'user' | 'assistant' | 'system';

export type StoredMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: string;
};

export type Message = StoredMessage; // Alias for consistency

export type TimelineEvent = {
  id: string;
  title: string;
  details: string;
  createdAt: string;
};

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolOutput {
  tool_call_id: string;
  output: string; // JSON string or plain text
}