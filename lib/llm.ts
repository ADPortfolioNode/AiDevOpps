import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// A map to cache LLM instances
const llmInstances = new Map<string, BaseChatModel>();

/**
 * Gets a cached or new instance of a chat model based on the provider and model name.
 * @param provider The LLM provider (e.g., 'openai', 'gemini', 'ollama').
 * @param modelName The name of the model to use.
 * @returns An instance of a LangChain chat model.
 */
export function getChatModel(provider: string, modelName: string): BaseChatModel {
  const cacheKey = `${provider}-${modelName}`;
  if (llmInstances.has(cacheKey)) {
    return llmInstances.get(cacheKey)!;
  }

  let model: BaseChatModel;

  switch (provider) {
    case 'openai':
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set.');
      model = new ChatOpenAI({
        apiKey: OPENAI_API_KEY,
        modelName: modelName,
        temperature: 0.1,
      });
      break;
    case 'gemini':
      if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set.');
      model = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: modelName,
        temperature: 0.1,
      });
      break;
    case 'ollama':
    default:
      model = new ChatOllama({
        baseUrl: OLLAMA_BASE_URL,
        model: modelName,
        temperature: 0.1,
      });
      break;
  }

  llmInstances.set(cacheKey, model);
  return model;
}