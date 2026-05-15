import { NextResponse } from 'next/server';
import { withCorsInit } from '@/lib/cors';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, withCorsInit());
}