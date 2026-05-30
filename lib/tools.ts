import { DynamicTool } from '@langchain/core/tools';
import { retrieveContext } from './agents/ragAssistant';
import { addTimelineEvent } from './serverCache'; // Adjust if path is different

/**
 * Creates the set of tools for the agent, including a RAG tool
 */
export function createTools(userId?: string) {
  const ragTool = new DynamicTool({
    name: "knowledge_base_search",
    description: "Search the user's private knowledge base for relevant context. Use this tool first for any question that might relate to uploaded documents or company data.",
    func: async (input: string) => {
      try {
        const context = await retrieveContext(input, userId);
        addTimelineEvent('RAG Search', `Retrieved context for: ${input.substring(0, 50)}...`);
        // The 'retrieveContext' function returns a pre-formatted string, so we return it directly.
        return context;
      } catch (error) {
        console.error('Error using knowledge base retriever:', error);
        return 'An error occurred while searching the knowledge base.';
      }
    },
  });
  
  return [ragTool];
}