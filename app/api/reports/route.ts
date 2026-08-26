import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sessions = memoryStore.getAllSessions();

  const summarized = sessions.map((s) => ({
    id: s.id,
    query: s.query,
    status: s.status,
    currentStage: s.currentStage,
    depth: s.depth,
    maxDepth: s.maxDepth,
    totalSources: s.sources.length,
    hasReport: Boolean(s.finalReport),
    decision: s.gatekeeper?.decision,
    durationMs: s.durationMs,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return NextResponse.json(summarized);
}
