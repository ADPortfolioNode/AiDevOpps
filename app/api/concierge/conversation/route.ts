import { type NextRequest, NextResponse } from 'next/server';
import { addConversationMessage, addTimelineEvent, getConversationHistory } from '@/lib/serverCache';
import { addToVectorStore, semanticSearch } from '@/lib/vectorStore';
// import { OpenAIStream, StreamingTextResponse } from 'ai'; // Not needed for a placeholder response

// // Temporarily commented out for minimal build to resolve compilation issues
// // import { ModelRouter } from '@/lib/ai/router';
// // import { ToolRegistry } from '@/lib/agents/tools';
// // import { AgentLogger } from '@/lib/observability/logger';
// // import { OpenAIProvider } from '@/lib/ai/openai-provider';
// // import { ConciergeAgent } from '@/lib/agents/concierge-agent';
//
// // // Import and Register Tools
// // import { weatherTool } from '@/lib/agents/tools/weather-tool';
//
// // // Register tools to make them discoverable by the agent
// // ToolRegistry.register(weatherTool);

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

  try {
    // This route is temporarily disabled for a minimal build.
    // The main chat functionality is handled by /api/chat.
    return NextResponse.json({
      message: "This concierge conversation route is temporarily disabled for a minimal build. Please use the main chat functionality."
    }, { status: 200 });
  } catch (error: any) {
    // console.error('ConversationAPI', 'Failed to get response from AI', error); // Use console.error for now
    return NextResponse.json({ error: 'Failed to get response from AI.' }, { status: 500 });
  }
}