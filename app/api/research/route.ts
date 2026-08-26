import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { researchService } from '@/lib/services/researchService';
import type { CreateResearchInput } from '@/lib/types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateResearchInput;
    const { query, maxDepth } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'A valid, non-empty research query is required.' },
        { status: 400 }
      );
    }

    const session = memoryStore.createSession(query, maxDepth);

    // Trigger workflow in background without blocking API response
    researchService.executeSession(session.id).catch((err) => {
      console.error(`Background research failed for session ${session.id}:`, err);
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        query: session.query,
        status: session.status,
        maxDepth: session.maxDepth,
        createdAt: session.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
