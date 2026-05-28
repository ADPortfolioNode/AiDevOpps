import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { getChatModel } from '../llm';
import { createAgentTools } from '../tools';

const AGENT_SYSTEM_PROMPT = `You are a helpful assistant named AiDevOps Concierge.
You have access to a number of tools to help answer user questions.
Your primary tools are a knowledge base retriever for internal documents and a web search tool for public information.
When asked a question, first decide if you can answer it from the conversation history.
If not, decide which tool is most appropriate.
If the user is asking about internal projects, code, or documents, use the 'knowledge-base-retriever'.
For general questions, news, or public information, use the 'tavily_search_results_json'.
For weather, use the 'weather-lookup' tool.
Always respond to the user in a helpful and friendly tone.`;

export async function createConciergeAgent(userId: string, modelName: string) {
  const llm = getChatModel('openai', modelName);
  const tools = createAgentTools(userId);

  const prompt = await ChatPromptTemplate.fromMessages([
    ['system', AGENT_SYSTEM_PROMPT],
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = await createOpenAIToolsAgent({
    llm,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    verbose: process.env.NODE_ENV === 'development', // Enable logging in dev
  });
}