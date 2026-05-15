import { BaseAgent } from './agents/base';
import { AIProvider } from './ai/provider';
import { ToolRegistry } from './agents/tools';

/**
 * Concrete implementation of the Concierge Agent.
 * Handles multi-model orchestration and tool discovery.
 */
export class ConciergeAgent extends BaseAgent {
  constructor(provider: AIProvider) {
    super('Concierge', provider, ToolRegistry.getTools(), 
      'You are a helpful AI assistant named Concierge. You are part of the AiDevOpps platform. Use your tools and general knowledge to assist the user.'
    );
  }
}