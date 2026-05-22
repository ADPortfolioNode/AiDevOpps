import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { getChatModel } from '@/lib/llm';
import { createAgentTools } from '@/lib/tools';

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * The Concierge Agent, refactored to use the ReAct (Reasoning and Acting) pattern.
 * It can reason about which tools to use (like RAG or weather) to answer a query.
 */
export async function conciergeAgent(
  messages: AgentMessage[],
  currentModel: string,
  userId: string, // For potential user-specific RAG
): Promise<string> {
  const userQuery = messages[messages.length - 1]?.content;

  if (!userQuery) {
    return "I didn't receive a query. How can I help you?";
  }

  try {
    // 1. Determine provider and model name from currentModel string
    let provider: string;
    let modelName: string;

    if (currentModel.startsWith('gpt-')) {
      provider = 'openai';
      modelName = currentModel;
    } else if (currentModel.startsWith('gemini-')) {
      provider = 'gemini';
      modelName = currentModel;
    } else {
      provider = 'ollama';
      modelName = process.env.LLM_MODEL_NAME || 'llama3'; // Fallback for 'llama-local'
    }

    // 2. Get the appropriate LLM instance and the ReAct prompt
    const llm = getChatModel(provider, modelName);
    const prompt = await pull<ChatPromptTemplate>('hwchase17/react-chat');

    // Create tools for the agent, passing the userId for RAG context
    const tools = createAgentTools(userId);

    // 3. Create the ReAct agent
    const agent = await createReactAgent({
      llm,
      tools,
      prompt,
    });
    // 4. Create the Agent Executor with the dynamically created tools
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: process.env.NODE_ENV === 'development', // Log agent steps in dev
    });

    // 5. Convert message history to LangChain's format
    const chat_history = messages.slice(0, -1).map((msg) => {
      return msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    // 6. Invoke the agent
    const result = await agentExecutor.invoke({
      input: userQuery,
      chat_history,
    });

    return result.output;
  } catch (error) {
    console.error('Error in Concierge ReAct Agent:', error);
    return 'An error occurred while processing your request. Please check the server logs.';
  }
}