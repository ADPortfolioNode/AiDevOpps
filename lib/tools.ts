import { DynamicTool } from '@langchain/core/tools';
import { retrieveContext } from './agents/ragAssistant';

/**
 * Creates and returns the tools that the Concierge agent can use.
 * This includes a dynamic tool for retrieving information from the knowledge base.
 * @param userId The ID of the user, for multi-tenant RAG.
 * @returns An array of tools for the agent.
 */
export function createAgentTools(userId: string) {
  const knowledgeBaseRetriever = new DynamicTool({
    name: 'knowledge-base-retriever',
    description:
      'Use this tool to find information about internal projects, documentation, and user-specific files. Provide a detailed query about what you are looking for.',
    func: async (input: string) => {
      try {
        const context = await retrieveContext(input, userId);
        return context.join('\n\n---\n\n');
      } catch (error) {
        console.error('Error using knowledge base retriever:', error);
        return 'An error occurred while searching the knowledge base.';
      }
    },
  });

  // In the future, other tools like web search (Tavily) or weather lookups can be added here.
  const tools = [knowledgeBaseRetriever];

  return tools;
}