import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { addConversationMessage, addTimelineEvent } from '@/lib/serverCache';
import { createConciergeAgent } from '@/lib/agents/conciergeAgent';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { StreamingTextResponse, LangChainStream } from 'ai';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// TODO: Replace with your actual authentication logic.
// This is a placeholder to allow the application to build and run.
const getAuthSession = async () => {
  return Promise.resolve({ user: { id: 'anonymous-user' } });
};

export async function POST(request: NextRequest) {
  try {
    const { stream, handlers } = LangChainStream({
      onFinal: async (completion) => {
        // Store final assistant response in server-side cache after the stream is complete
        const assistantMessageRecord = {
          id: `msg_${Date.now()}`,
          role: 'assistant' as const,
          content: completion,
          createdAt: new Date(),
        };
        addConversationMessage(assistantMessageRecord);
        addTimelineEvent('Assistant Response', `Assistant finished streaming response.`);
      },
    });

    const body = await request.json();
    const { messages, model: modelName = 'gpt-4o-mini' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const currentMessage = messages[messages.length - 1];
    const previousMessages = messages.slice(0, -1);

    // Get the current user session
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Add user message to server-side history
    addConversationMessage({
      id: currentMessage.id || uuidv4(),
      role: 'user',
      content: currentMessage.content,
      createdAt: new Date(),
    });
    addTimelineEvent('User Message', `User sent: "${currentMessage.content.substring(0, 50)}..."`);

    // Use LangChain's in-memory history for the agent
    const chatHistory = new ChatMessageHistory();
    for (const msg of previousMessages) {
        if (msg.role === 'user') {
            await chatHistory.addMessage(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
            await chatHistory.addMessage(new AIMessage(msg.content));
        }
    }

    // Create the agent executor
    const agentExecutor = await createConciergeAgent(userId, modelName);
    
    // Invoke the agent and stream the response
    addTimelineEvent('Agent Invoked', `Concierge agent is processing the query...`);
    agentExecutor.invoke({
      input: currentMessage.content,
      chat_history: await chatHistory.getMessages(),
    }, {
      callbacks: [handlers], // Pass the stream handlers to the agent
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    addTimelineEvent('Error', `Chat error: ${errorMessage}`);

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Ensure a consistent error response format
    return NextResponse.json(
      // In development, send the detailed error message to the client to aid in debugging.
      { error: isDevelopment ? `Agent Error: ${errorMessage}` : 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
