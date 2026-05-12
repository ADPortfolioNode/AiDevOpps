import { NextResponse } from 'next/server';
import { withCorsInit } from '@/lib/cors';

export async function OPTIONS() {
  return NextResponse.json(null, withCorsInit({ status: 204 }));
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'AiDevOpps Concierge API',
      timestamp: new Date().toISOString()
    },
    withCorsInit()
  );
}
