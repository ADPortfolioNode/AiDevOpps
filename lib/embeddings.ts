import { OpenAIEmbeddings } from '@langchain/openai';
import { Embeddings } from '@langchain/core/embeddings';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL_NAME = process.env.EMBEDDING_MODEL_NAME || 'text-embedding-ada-002';

let embeddingsInstance: Embeddings | null = null;

/**
 * Initializes and returns a singleton instance of the embedding model.
 * For this production-ready build, we are focusing on OpenAIEmbeddings.
 */
export function getEmbeddingModel(): Embeddings {
  if (!embeddingsInstance) {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Please add it to your .env.local file.');
    }
    embeddingsInstance = new OpenAIEmbeddings({
      modelName: EMBEDDING_MODEL_NAME,
      openAIApiKey: OPENAI_API_KEY,
    });
  }
  return embeddingsInstance;
}

/**
 * Generates an embedding for a single query string.
 * @param text The text to embed.
 * @returns A promise that resolves to a single embedding vector.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const model = getEmbeddingModel();
  return model.embedQuery(text);
}

/**
 * Generates embeddings for an array of documents.
 * @param texts The array of texts to embed.
 * @returns A promise that resolves to an array of embedding vectors.
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const model = getEmbeddingModel();
  return model.embedDocuments(texts);
}