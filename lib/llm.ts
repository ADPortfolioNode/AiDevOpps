// lib/llm.ts
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FakeListChatModel } from '@langchain/core/utils/testing';

export const DEMO_RESPONSE =
  'AiDevOps is a Next.js dashboard for AI Operations Management. It helps you ingest documents, search your knowledge base with RAG, and chat with a Concierge agent.';

export function isLlmConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY);
}

function createDemoModel(): BaseChatModel {
  return new FakeListChatModel({ responses: [DEMO_RESPONSE] }) as unknown as BaseChatModel;
}

/**
 * Returns a chat model with demo fallback. Prefers Gemini when configured to avoid OpenAI quota issues.
 */
export function getChatModel(modelName: string): BaseChatModel {
  if (!isLlmConfigured()) {
    console.warn('ℹ️ No LLM API keys configured — using demo chat model.');
    return createDemoModel();
  }

  const demo = createDemoModel();

  if (process.env.GOOGLE_API_KEY) {
    const gemini = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash',
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0,
    });
    return gemini.withFallbacks({ fallbacks: [demo] }) as unknown as BaseChatModel;
  }

  const openAI = new ChatOpenAI({
    modelName,
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  return openAI.withFallbacks({ fallbacks: [demo] }) as unknown as BaseChatModel;
}
