// lib/embeddings.ts
import { OpenAIEmbeddings } from '@langchain/openai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

/**
 * Returns an instance of the embeddings model.
 * Falls back to Google embeddings if the OpenAI API key is missing.
 */
export function getEmbeddings() {
  const useGoogle = !process.env.OPENAI_API_KEY && !!process.env.GOOGLE_API_KEY;

  if (useGoogle) {
    return new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  return new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small', // A cost-effective and performant default
  });
}