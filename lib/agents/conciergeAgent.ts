import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import {
  SystemMessage,
  HumanMessage,
} from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { createTools } from '../tools';
import { addTimelineEvent } from '../serverCache';

const CONCIERGE_PROMPT = `You are AiDevOpps, a helpful AI assistant for managing software development operations.
Your role is to act as a concierge, using your available tools to answer questions and perform tasks.
When searching the knowledge base, be concise and directly answer the user's question based on the retrieved context.
If the knowledge base does not contain the answer, say so. Do not make up information.
Always be professional and helpful.`;

export const createConciergeAgent = async (userId: string, modelName: string) => {
  addTimelineEvent('Agent Creation', `Initializing Concierge Agent with model: ${modelName}`);
  const llm = new ChatOpenAI({
    modelName,
    temperature: 0,
    streaming: true,
  });

  const tools = createTools(userId);

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(CONCIERGE_PROMPT),
    new MessagesPlaceholder('chat_history'),
    new HumanMessage('{input}'),
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });

  return new AgentExecutor({
    agent,
    tools,
    verbose: process.env.NODE_ENV === 'development',
  });
};