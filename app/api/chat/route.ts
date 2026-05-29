import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { addConversationMessage, addTimelineEvent } from '@/lib/serverCache';
import { createConciergeAgent } from '@/lib/agents/conciergeAgent';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model: modelName = 'gpt-4o-mini' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const currentMessage = messages[messages.length - 1];
    const previousMessages = messages.slice(0, -1);

    // The user ID should come from an authentication system in a real app
    const userId = 'user-123';

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
    
    // Generate response
    addTimelineEvent('Agent Invoked', `Concierge agent is processing the query...`);
    const response = await agentExecutor.invoke({
      input: currentMessage.content,
      chat_history: await chatHistory.getMessages(),
    });

    const assistantMessage = response.output;
    
    // Store assistant response in server-side cache
    const assistantMessageRecord = {
      id: `msg_${Date.now()}`,
      role: 'assistant' as const,
      content: String(assistantMessage),
      createdAt: new Date(),
    };
    addConversationMessage(assistantMessageRecord);

    addTimelineEvent('Assistant Response', `Assistant replied to user query`);

    // Return the response for the client
    return NextResponse.json({
      id: assistantMessageRecord.id,
      role: 'assistant',
      content: assistantMessage,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    addTimelineEvent('Error', `Chat error: ${errorMessage}`);

    // Ensure a consistent error response format
    return NextResponse.json(
      { 
        error: 'An internal error occurred.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
