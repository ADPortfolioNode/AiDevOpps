import { NextRequest, NextResponse } from 'next/server';
import { addConversationMessage, addTimelineEvent, getConversationHistory } from '@/lib/serverCache';
import { addToVectorStore } from '@/lib/vectorStore';
import { withCorsInit } from '@/lib/cors';

export async function OPTIONS() {
  return NextResponse.json(null, withCorsInit({ status: 204 }));
}

export async function GET() {
  return NextResponse.json({ conversation: getConversationHistory() }, withCorsInit());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompt = String(body.prompt || '').trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, withCorsInit({ status: 400 }));
  }

  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    text: prompt,
    createdAt: new Date().toISOString()
  };

  addConversationMessage(userMessage);
  await addToVectorStore(userMessage);
  addTimelineEvent('New user prompt', prompt);

  const aiText = `I received your request and I am preparing a response for: "${prompt}"`;
  const aiMessage = {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    text: aiText,
    createdAt: new Date().toISOString()
  };

  addConversationMessage(aiMessage);
  await addToVectorStore(aiMessage);
  addTimelineEvent('AI response generated', `Generated a reply for the prompt: ${prompt}`);

  return NextResponse.json(
    {
      message: aiMessage,
      conversation: getConversationHistory()
    },
    withCorsInit()
  );
}
