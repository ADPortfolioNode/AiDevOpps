import { NextRequest, NextResponse } from 'next/server';
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { addConversationMessage, addTimelineEvent } from '@/lib/serverCache';
import { getChatModel, isLlmConfigured, DEMO_RESPONSE } from '@/lib/llm';
import { semanticSearch } from '@/lib/vectorStore';
import { StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic';

const CONCIERGE_PROMPT = `You are AiDevOps, a helpful AI assistant for managing software development operations.
Answer using the retrieved knowledge base context when it is relevant.
If the context does not contain the answer, say so briefly and answer from general knowledge about AiDevOps.
Be professional, concise, and helpful.`;

const getAuthSession = async () => {
  return Promise.resolve({ user: { id: 'anonymous-user' } });
};

function textStreamResponse(text: string): StreamingTextResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const tokens = text.match(/\S+\s*/g) ?? [text];
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      controller.close();
    },
  });
  return new StreamingTextResponse(stream);
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : (part as { text?: string }).text || ''))
      .join('');
  }
  return DEMO_RESPONSE;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model: modelName = 'gpt-4o-mini' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const currentMessage = messages[messages.length - 1];
    const previousMessages = messages.slice(0, -1);

    addConversationMessage({
      id: currentMessage.id || crypto.randomUUID(),
      role: 'user',
      content: currentMessage.content,
      createdAt: new Date(),
    });
    addTimelineEvent('User Message', `User sent: "${currentMessage.content.substring(0, 50)}..."`);

    const searchQuery = currentMessage.content;
    const contextChunks = await semanticSearch(searchQuery, userId);
    addTimelineEvent(
      'Tool Used',
      `RAG Assistant searching knowledge base for: ${searchQuery.substring(0, 50)}... (Retrieved ${contextChunks.length} chunks)`,
    );

    const contextBlock =
      contextChunks.length > 0
        ? contextChunks.join('\n\n')
        : 'No matching documents found in the knowledge base.';

    const history: BaseMessage[] = previousMessages.map((msg: { role: string; content: string }) => {
      if (msg.role === 'user') return new HumanMessage(msg.content);
      if (msg.role === 'assistant') return new AIMessage(msg.content);
      return new SystemMessage(msg.content);
    });

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(`${CONCIERGE_PROMPT}\n\n--- Knowledge Base Context ---\n${contextBlock}`),
      new MessagesPlaceholder('chat_history'),
      new HumanMessage('{input}'),
    ]);

    addTimelineEvent('Agent Invoked', 'Concierge agent is processing the query...');

    let answer = DEMO_RESPONSE;

    if (isLlmConfigured()) {
      try {
        const llm = getChatModel(modelName);
        const chain = prompt.pipe(llm);
        const result = await chain.invoke({
          input: currentMessage.content,
          chat_history: history,
        });
        answer = extractText(result.content);
      } catch (error) {
        console.error('Chat chain error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        addTimelineEvent('Error', `Chat error: ${errorMsg}`);
        answer = DEMO_RESPONSE;
      }
    }

    addConversationMessage({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: answer,
      createdAt: new Date(),
    });
    addTimelineEvent('Assistant Response', 'Assistant finished streaming response.');

    return textStreamResponse(answer);
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    addTimelineEvent('Error', `Chat error: ${errorMessage}`);

    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { error: isDevelopment ? `Agent Error: ${errorMessage}` : 'An internal error occurred.' },
      { status: 500 },
    );
  }
}
