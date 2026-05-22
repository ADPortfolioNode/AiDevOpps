import { getChromaCollection } from '@/lib/chroma'; // Import the centralized collection getter
import { embedQuery } from '@/lib/embeddings';

// Allow the number of RAG results to be configurable
const RAG_N_RESULTS = process.env.RAG_N_RESULTS ? parseInt(process.env.RAG_N_RESULTS, 10) : 3;

/**
 * The RAG Assistant is responsible for retrieving relevant context
 * from the Chroma vector store based on a user query.
 * @param query The user's query.
 * @param userId Optional user ID for potential user-specific knowledge bases.
 * @returns An array of relevant document chunks (strings).
 */
export async function retrieveContext(query: string, userId?: string): Promise<string[]> {
  try {
    const collection = await getChromaCollection(); // Use the centralized function

    const queryEmbeddings = await embedQuery(query);

    const where: Record<string, any> | undefined = userId
      ? { $or: [{ userId: userId }, { userId: { $exists: false } }] }
      : undefined;

    const results = await collection.query({ queryEmbeddings, nResults: RAG_N_RESULTS, where });

    if (results.documents && results.documents.length > 0) {
      return results.documents.flat().filter((doc): doc is string => typeof doc === 'string');
    }
    return [];
  } catch (error) {
    console.error('Error retrieving context from ChromaDB:', error);
    return [];
  }
}