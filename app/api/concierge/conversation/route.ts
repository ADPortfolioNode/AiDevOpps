import { type NextRequest, NextResponse } from 'next/server';
import { addConversationMessage, addTimelineEvent, getConversationHistory } from '@/lib/serverCache';
import { addToVectorStore, semanticSearch } from '@/lib/vectorStore';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Import the full agent architecture
import { ModelRouter } from '@/lib/ai/router';
import { ToolRegistry } from '@/lib/agents/tools';
import { AgentLogger } from '@/lib/observability/logger';
import { OpenAIProvider } from '@/lib/ai/openai-provider';
import { ConciergeAgent } from '@/lib/agents/concierge-agent';

// Import and Register Tools
import { weatherTool } from '@/lib/agents/tools/weather-tool';

// Register tools to make them discoverable by the agent
ToolRegistry.register(weatherTool);

export async function GET() {
  const conversation = getConversationHistory();
  return NextResponse.json({ conversation });
}

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const userMessage = messages[messages.length - 1];

  // Immediately add the user's message to history and vector store for RAG
  if (userMessage && userMessage.role === 'user') {
    const newEntry = {
      id: userMessage.id,
      role: 'user' as const,
      text: userMessage.content,
      createdAt: new Date().toISOString(),
    };
    addConversationMessage(newEntry);
    await addToVectorStore(newEntry);
    addTimelineEvent('User Message', `User sent: "${userMessage.content.substring(0, 50)}..."`);
  }

  // Perform RAG to get relevant context
  const context = await semanticSearch(userMessage.content)
    .then(results => results.map((res: any) => res.text).join('\n\n'))
    .catch(err => {
      AgentLogger.error('RAG Search', 'Failed to retrieve context', err);
      return '';
    });

  try {
    // 1. Route to the appropriate model based on policy
    const selectedModel = ModelRouter.route('cost-optimized');
    AgentLogger.trace('Concierge', 'Model Selected', { model: selectedModel });

    // 2. Initialize the provider and agent
    const provider = new OpenAIProvider(selectedModel);
    const agent = new ConciergeAgent(provider);

    // 3. Get the stream from the agent
    const openaiResponseStream = await agent.stream(messages, context);

    // 4. Use the Vercel AI SDK to stream the response with tool handling
    const stream = OpenAIStream(openaiResponseStream, {
      experimental_onToolCall: async (toolCallPayload, appendToolCallMessage) => {
        AgentLogger.trace('Concierge', 'Tool call detected', { toolCallPayload });
        for (const tool of toolCallPayload.tools) {
          const result = await agent.executeTool(tool);
          appendToolCallMessage({ tool_call_id: tool.id, function_name: tool.function.name, tool_result: result.output });
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    AgentLogger.error('ConversationAPI', 'Failed to get response from AI', error);
    return NextResponse.json({ error: 'Failed to get response from AI.' }, { status: 500 });
  }
}