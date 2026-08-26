import { randomUUID } from 'crypto';
import { env } from '@/src/config';
import type {
  ResearchSession,
  ResearchStage,
  SessionStatus,
  CriticRoundRecord,
} from './types';
import type { ResearchFinding } from '@/src/state';

/**
 * In-Memory storage singleton managing active and past research sessions.
 * Attached to globalThis for persistence during Next.js development hot-reloads.
 */
class MemoryStore {
  private sessions = new Map<string, ResearchSession>();

  public createSession(query: string, maxDepth?: number): ResearchSession {
    const id = randomUUID();
    const now = new Date().toISOString();

    const session: ResearchSession = {
      id,
      query: query.trim(),
      status: 'queued',
      currentStage: 'idle',
      maxDepth: maxDepth ?? env.MAX_DEPTH,
      depth: 0,
      subQueries: [],
      sources: [],
      rejectedSourceIndices: [],
      criticHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  public getSession(id: string): ResearchSession | undefined {
    return this.sessions.get(id);
  }

  public updateSession(
    id: string,
    updates: Partial<ResearchSession>
  ): ResearchSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession: ResearchSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  public setStage(
    id: string,
    stage: ResearchStage,
    status?: SessionStatus
  ): ResearchSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    return this.updateSession(id, {
      currentStage: stage,
      ...(status ? { status } : {}),
    });
  }

  public addSources(id: string, newFindings: ResearchFinding[]): void {
    const session = this.sessions.get(id);
    if (!session) return;

    const seenUrls = new Set(session.sources.map((s) => s.url).filter(Boolean));
    const merged = [...session.sources];

    for (const finding of newFindings) {
      if (!finding.url || !seenUrls.has(finding.url)) {
        if (finding.url) seenUrls.add(finding.url);
        merged.push(finding);
      }
    }

    this.updateSession(id, { sources: merged });
  }

  public addCriticRound(id: string, record: CriticRoundRecord): void {
    const session = this.sessions.get(id);
    if (!session) return;

    this.updateSession(id, {
      depth: record.depth,
      criticHistory: [...session.criticHistory, record],
    });
  }

  public completeSession(id: string, finalReport: string): ResearchSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const startTime = new Date(session.createdAt).getTime();
    const durationMs = Date.now() - startTime;

    return this.updateSession(id, {
      status: 'completed',
      currentStage: 'completed',
      finalReport,
      durationMs,
    });
  }

  public failSession(id: string, error: string): ResearchSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const startTime = new Date(session.createdAt).getTime();
    const durationMs = Date.now() - startTime;

    return this.updateSession(id, {
      status: 'failed',
      currentStage: 'failed',
      error,
      durationMs,
    });
  }

  public getAllSessions(): ResearchSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  public clear(): void {
    this.sessions.clear();
  }
}

// Preserve global singleton in Next.js development
const globalForStore = globalThis as unknown as { memoryStore: MemoryStore };
export const memoryStore = globalForStore.memoryStore || new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.memoryStore = memoryStore;
