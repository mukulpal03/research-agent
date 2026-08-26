import { EventEmitter } from 'events';
import type { SSEEventType, SSEMessage } from './types';

class EventDispatcher extends EventEmitter {
  private activeControllers = new Map<string, Set<ReadableStreamDefaultController>>();

  public registerStreamController(
    sessionId: string,
    controller: ReadableStreamDefaultController
  ): () => void {
    if (!this.activeControllers.has(sessionId)) {
      this.activeControllers.set(sessionId, new Set());
    }

    const controllerSet = this.activeControllers.get(sessionId)!;
    controllerSet.add(controller);

    const cleanup = () => {
      controllerSet.delete(controller);
      if (controllerSet.size === 0) {
        this.activeControllers.delete(sessionId);
      }
    };

    return cleanup;
  }

  public emitEvent<T = unknown>(
    sessionId: string,
    type: SSEEventType,
    data: T
  ): void {
    const payload: SSEMessage<T> = {
      type,
      sessionId,
      timestamp: new Date().toISOString(),
      data,
    };

    this.emit(`session:${sessionId}`, payload);
    this.emit('all', payload);

    const controllerSet = this.activeControllers.get(sessionId);
    if (controllerSet && controllerSet.size > 0) {
      const formattedChunk = new TextEncoder().encode(
        `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`
      );
      for (const controller of controllerSet) {
        try {
          controller.enqueue(formattedChunk);
        } catch {
          controllerSet.delete(controller);
        }
      }
    }
  }

  public closeSessionStreams(sessionId: string): void {
    const controllerSet = this.activeControllers.get(sessionId);
    if (controllerSet) {
      for (const controller of controllerSet) {
        try {
          controller.close();
        } catch {}
      }
      this.activeControllers.delete(sessionId);
    }
  }
}

const globalForDispatcher = globalThis as unknown as { eventDispatcher: EventDispatcher };
export const eventDispatcher = globalForDispatcher.eventDispatcher || new EventDispatcher();
if (process.env.NODE_ENV !== 'production') globalForDispatcher.eventDispatcher = eventDispatcher;
