// lib/agents/ragAssistant.ts
import { semanticSearch } from '../vectorStore';

export async function retrieveContext(query: string, userId?: string): Promise<string> {
  try {
    console.log(`[RAG] Retrieving context for query: "${query}"`);

    const searchResults = await semanticSearch(query, userId);

    if (searchResults.length === 0) {
      return "No relevant documents found in the knowledge base.";
    }

    return searchResults
      .map((doc, i) => `Source ${i + 1}:\n${doc}`)
      .join("\n\n---\n\n");
  } catch (error) {
    console.error('[RAG] Retrieval error:', error);
    return "Unable to retrieve relevant context at this time.";
  }
}
