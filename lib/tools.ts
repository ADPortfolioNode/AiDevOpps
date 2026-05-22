import { DynamicTool } from '@langchain/core/tools';
import { retrieveContext } from '@/lib/agents/ragAssistant';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
/**
 * Creates the set of tools for the agent, including a RAG tool
 * that can be scoped to a specific user.
 * @param userId The ID of the user, for user-specific document retrieval.
 * @returns An array of tools for the agent.
 */
export function createAgentTools(userId: string) {
  const knowledgeBaseTool = new DynamicTool({
    name: 'knowledge-base-retriever',
    description:
      "Use this tool to find information about internal projects, documents, and other stored knowledge. Input should be a user's question.",
    func: async (input: string) => {
      try {
        // Pass the userId to the context retrieval function
        const context = await retrieveContext(input, userId);
        return context.length > 0
          ? `Found relevant information:\n${context.join('\n---\n')}`
          : 'No specific information found in the knowledge base for that query.';
      } catch (error) {
        console.error('Error in knowledge base tool:', error);
        return 'There was an error accessing the knowledge base.';
      }
    },
  });

  /**
   * A mock tool for looking up the weather.
   */
  const weatherTool = new DynamicTool({
    name: 'weather-lookup',
    description:
      'Use this tool to get the current weather for a specific location. Input should be a city name, e.g., "San Francisco".',
    func: async (input: string) => {
      // In a real application, this would call a weather API.
      const city = input.toLowerCase();
      const temperatures: { [key: string]: string } = {
        'san francisco': '65°F and foggy',
        'new york': '75°F and sunny',
        london: '55°F and raining',
      };
      return temperatures[city] || `I don't have the weather for ${input}.`;
    },
  });

  /**
   * A tool for performing web searches using the Tavily API.
   * It automatically uses the TAVILY_API_KEY from environment variables.
   */
  const webSearchTool = new TavilySearchResults();

  return [knowledgeBaseTool, weatherTool, webSearchTool];
}