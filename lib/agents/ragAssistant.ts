import 'server-only';
import { semanticSearch } from '@/lib/vectorStore';

/**
 * The RAG Assistant is responsible for retrieving relevant context
 * from the vector store based on a user query.
 * @param query The user's query.
 * @param userId Optional user ID for potential user-specific knowledge bases.
 * @returns An array of relevant document chunks (strings).
 */
export async function retrieveContext(query: string, userId?: string): Promise<string[]> {
  // This is now a simple wrapper around the semanticSearch function.
  return semanticSearch(query, userId);
}