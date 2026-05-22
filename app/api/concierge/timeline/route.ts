import { NextResponse } from 'next/server';

export async function GET() {
  const timeline = [
    {
      id: 't-1',
      title: 'Vector Index Updated',
      details: 'Ingested 45 documentation nodes for enhanced RAG retrieval.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 't-2',
      title: 'Heuristic Drift Detected',
      details: 'Anomalous token usage pattern identified in cluster node US-EAST-1.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    }
  ];
  return NextResponse.json({ timeline });
}