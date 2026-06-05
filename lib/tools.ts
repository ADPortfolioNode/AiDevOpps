import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { semanticSearch } from './vectorStore';
import { addTimelineEvent } from './serverCache'; // Adjust if path is different

/**
 * Creates the set of tools for the agent, including a RAG tool
 */
export function createTools(userId?: string) {
  const ragTool = new DynamicStructuredTool({
    name: "knowledge_base_search",
    description: "Search the user's private knowledge base for relevant context. Use this tool first for any question that might relate to uploaded documents or company data.",
    schema: z.object({
      query: z.string().nullable().optional().describe("The search query to look up in the knowledge base.")
    }),
    func: async ({ query }) => {
      try {
        // Ensure query is a valid string and handle potential null/undefined values safely
        const searchQuery = (typeof query === 'string' && query.trim().length > 0) ? query : "general overview";
        const context = await semanticSearch(searchQuery, userId);
        const resultsCount = Array.isArray(context) ? context.length : 0;
        const contextString = Array.isArray(context) ? context.join('\n\n') : String(context);
        
        addTimelineEvent('Tool Used', `RAG Assistant searching knowledge base for: ${searchQuery.substring(0, 50)}... (Retrieved ${resultsCount} chunks)`);
        return contextString;
      } catch (error) {
        console.error('Error using knowledge base retriever:', error);
        return 'An error occurred while searching the knowledge base.';
      }
    },
  });
  
  return [ragTool];
}