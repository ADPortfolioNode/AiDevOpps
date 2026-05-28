import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { addConversationMessage, addTimelineEvent } from '@/lib/serverCache';
import { createConciergeAgent } from '@/lib/agents/conciergeAgent';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model: modelName = 'gpt-4o-mini' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const lastMessageContent = messages[messages.length - 1].content;
    addTimelineEvent('User Message', `User sent: "${lastMessageContent.substring(0, 50)}..."`);

    // The user ID should come from an authentication system in a real app
    const userId = 'user-123';

    // Convert the messages to the format LangChain expects
    const conversationMessages: BaseMessage[] = messages.map((msg: any) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
    
    // Separate the last user message for the agent's 'input'
    const currentInput = conversationMessages.pop()?.content as string;

    // Use LangChain's in-memory history for the agent
    const chatHistory = new ChatMessageHistory(conversationMessages);

    // Create the agent executor
    const agentExecutor = await createConciergeAgent(userId, modelName);
    
    // Generate response
    addTimelineEvent('Agent Invoked', `Concierge agent is processing the query...`);
    const response = await agentExecutor.invoke({
      input: currentInput,
      chat_history: await chatHistory.getMessages(),
    });

    const assistantMessage = response.output;

    // Store in cache
    addConversationMessage({
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: String(assistantMessage),
      createdAt: new Date().toISOString(),
    });

    addTimelineEvent('Assistant Response', `Assistant replied to user query`);

    return NextResponse.json({
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: assistantMessage,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    addTimelineEvent('Error', `Chat error: ${errorMessage}`);

    return NextResponse.json(
      { error: `Chat error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
