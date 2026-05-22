import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const EMBEDDING_MODEL_NAME = process.env.EMBEDDING_MODEL_NAME || 'nomic-embed-text';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let embeddingsInstance: OpenAIEmbeddings | OllamaEmbeddings | GoogleGenerativeAIEmbeddings | null = null;

/**
 * Initializes and returns the appropriate embedding model based on configuration.
 * Supports OpenAI, Gemini, and Ollama (for local models).
 */
export function getEmbeddingModel() {
  if (!embeddingsInstance) {
    if (EMBEDDING_MODEL_NAME.startsWith('text-embedding-') && OPENAI_API_KEY) {
      embeddingsInstance = new OpenAIEmbeddings({
        modelName: EMBEDDING_MODEL_NAME,
        openAIApiKey: OPENAI_API_KEY,
      });
    } else if (EMBEDDING_MODEL_NAME.startsWith('embedding-') && GEMINI_API_KEY) {
      embeddingsInstance = new GoogleGenerativeAIEmbeddings({
        apiKey: GEMINI_API_KEY,
        model: EMBEDDING_MODEL_NAME,
      });
    } else {
      // Default to Ollama for local embeddings
      embeddingsInstance = new OllamaEmbeddings({
        model: EMBEDDING_MODEL_NAME,
        baseUrl: OLLAMA_BASE_URL,
      });
    }
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