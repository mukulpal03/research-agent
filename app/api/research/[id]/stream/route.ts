import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { eventDispatcher } from '@/lib/events';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = memoryStore.getSession(id);

  if (!session) {
    return NextResponse.json(
      { error: `Research session ${id} not found.` },
      { status: 404 }
    );
  }

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial session snapshot
      const initialPayload = JSON.stringify({
        type: 'SESSION_INIT',
        sessionId: id,
        timestamp: new Date().toISOString(),
        data: { session },
      });
      controller.enqueue(
        new TextEncoder().encode(`event: SESSION_INIT\ndata: ${initialPayload}\n\n`)
      );

      // If already finished, close stream immediately
      if (session.status === 'completed' || session.status === 'failed') {
        controller.close();
        return;
      }

      // 2. Register controller in event dispatcher
      const cleanup = eventDispatcher.registerStreamController(id, controller);

      // Send periodic heartbeat comment every 15s to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
          cleanup();
        }
      }, 15000);
    },
    cancel() {
      // Stream cancelled by client disconnect
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
