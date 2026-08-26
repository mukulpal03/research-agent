'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ResearchSession,
  ResearchStage,
  SSEEventType,
  SSEMessage,
  WorkerStatusPayload,
  LogMessagePayload,
} from '../lib/types';
import type { ResearchFinding } from '../src/state';

export interface UseResearchStreamReturn {
  session: ResearchSession | null;
  stage: ResearchStage;
  statusMessage: string;
  isStreaming: boolean;
  error: string | null;
  subQueries: string[];
  sources: ResearchFinding[];
  reportMarkdown: string;
  workers: WorkerStatusPayload[];
  logs: LogMessagePayload[];
  startResearch: (query: string, maxDepth?: number) => Promise<string | null>;
  stopStream: () => void;
  loadPastSession: (sessionId: string) => Promise<void>;
  reset: () => void;
}

export function useResearchStream(): UseResearchStreamReturn {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [stage, setStage] = useState<ResearchStage>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [subQueries, setSubQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<ResearchFinding[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [workers, setWorkers] = useState<WorkerStatusPayload[]>([]);
  const [logs, setLogs] = useState<LogMessagePayload[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stopStream();
    setSession(null);
    setStage('idle');
    setStatusMessage('');
    setError(null);
    setSubQueries([]);
    setSources([]);
    setReportMarkdown('');
    setWorkers([]);
    setLogs([]);
  }, [stopStream]);

  const loadPastSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/reports/${sessionId}`);
      if (!res.ok) throw new Error('Failed to load past session');
      const data: ResearchSession = await res.json();

      setSession(data);
      setStage(data.currentStage);
      setSubQueries(data.subQueries || []);
      setSources(data.sources || []);
      setReportMarkdown(data.finalReport || '');
      setStatusMessage(data.status === 'completed' ? 'Research Completed' : data.status);
      setError(data.error || null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error loading session';
      setError(msg);
    }
  }, []);

  const connectToStream = useCallback((sessionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsStreaming(true);
    const eventSource = new EventSource(`/api/research/${sessionId}/stream`);
    eventSourceRef.current = eventSource;

    const handleEvent = (event: MessageEvent, type: SSEEventType) => {
      try {
        const payload: SSEMessage<any> = JSON.parse(event.data);
        const { data } = payload;

        switch (type) {
          case 'SESSION_INIT': {
            if (data.session) {
              setSession(data.session);
              setStage(data.session.currentStage || 'idle');
              setSubQueries(data.session.subQueries || []);
              setSources(data.session.sources || []);
              setReportMarkdown(data.session.finalReport || '');
              if (data.session.status === 'completed' || data.session.status === 'failed') {
                setIsStreaming(false);
                eventSource.close();
              }
            }
            break;
          }

          case 'STAGE_CHANGED': {
            setStage(data.stage);
            if (data.message) {
              setStatusMessage(data.message);
              setLogs((prev) => [
                ...prev,
                { message: data.message, type: 'info', timestamp: new Date().toISOString() },
              ]);
            }
            break;
          }

          case 'GATEKEEPER_DONE': {
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    gatekeeper: {
                      decision: data.decision,
                      reasoning: data.reasoning,
                      directResponse: data.directResponse,
                    },
                  }
                : null
            );
            if (data.decision === 'direct_answer' && data.directResponse) {
              setReportMarkdown(data.directResponse);
            }
            setLogs((prev) => [
              ...prev,
              {
                message: `Gatekeeper decision: ${data.decision === 'direct_answer' ? 'Direct Answer' : 'Deep Research Required'}`,
                type: 'info',
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
          }

          case 'PLANNER_DONE': {
            if (data.subQueries) {
              setSubQueries(data.subQueries);
            }
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    subQueries: data.subQueries || prev.subQueries,
                    depth: data.depth || prev.depth,
                  }
                : null
            );
            setLogs((prev) => [
              ...prev,
              {
                message: `Planner formulated ${data.subQueries?.length || 0} sub-questions`,
                type: 'info',
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
          }

          case 'WORKER_STATUS': {
            if (data.workerIndex) {
              setWorkers((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((w) => w.workerIndex === data.workerIndex);
                if (idx !== -1) {
                  updated[idx] = { ...updated[idx], ...data };
                } else {
                  updated.push(data);
                }
                return updated;
              });
            }
            break;
          }

          case 'LOG_MESSAGE': {
            if (data.message) {
              setLogs((prev) => [
                ...prev,
                {
                  message: data.message,
                  type: data.type || 'info',
                  timestamp: data.timestamp || new Date().toISOString(),
                },
              ]);
            }
            break;
          }

          case 'RESEARCHER_SOURCES': {
            if (data.sources) {
              setSources((prev) => {
                const seen = new Set(prev.map((s) => s.url).filter(Boolean));
                const merged = [...prev];
                for (const s of data.sources) {
                  if (!s.url || !seen.has(s.url)) {
                    if (s.url) seen.add(s.url);
                    merged.push(s);
                  }
                }
                return merged;
              });
              setSession((prev) =>
                prev
                  ? {
                      ...prev,
                      sources: [...(prev.sources || []), ...(data.sources || [])],
                    }
                  : null
              );
            }
            break;
          }

          case 'CRITIC_EVALUATED': {
            if (data.nextSubQueries && data.nextSubQueries.length > 0) {
              setSubQueries(data.nextSubQueries);
            }
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    depth: data.depth || prev.depth,
                    criticHistory: [
                      ...(prev.criticHistory || []),
                      {
                        depth: data.depth || prev.depth,
                        maxDepth: data.maxDepth || prev.maxDepth,
                        isSatisfied: data.isSatisfied,
                        critique: data.critique,
                        nextSubQueries: data.nextSubQueries || [],
                        purgedSourceCount: data.purgedSourceCount || 0,
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  }
                : null
            );
            setLogs((prev) => [
              ...prev,
              {
                message: `Critic Round ${data.depth}: ${data.isSatisfied ? 'Satisfied (Approved)' : 'Identified gaps, continuing research'}`,
                type: data.isSatisfied ? 'success' : 'warn',
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
          }

          case 'SYNTHESIS_CHUNK': {
            setReportMarkdown((prev) => prev + (data.chunk || ''));
            break;
          }

          case 'RESEARCH_COMPLETE': {
            if (data.session) {
              setSession(data.session);
              if (data.session.finalReport) {
                setReportMarkdown(data.session.finalReport);
              }
            }
            setStage('completed');
            setStatusMessage('Research completed.');
            setLogs((prev) => [
              ...prev,
              {
                message: 'Research workflow successfully completed report.',
                type: 'success',
                timestamp: new Date().toISOString(),
              },
            ]);
            setIsStreaming(false);
            eventSource.close();
            break;
          }

          case 'RESEARCH_ERROR': {
            const errorMsg = data.error || 'An unexpected error occurred during research.';
            setError(errorMsg);
            setSession((prev) => (prev ? { ...prev, status: 'failed' } : null));
            setStage('failed');
            setIsStreaming(false);
            eventSource.close();
            break;
          }
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    const eventTypes: SSEEventType[] = [
      'SESSION_INIT',
      'STAGE_CHANGED',
      'GATEKEEPER_DONE',
      'PLANNER_DONE',
      'RESEARCHER_START',
      'RESEARCHER_SOURCES',
      'WORKER_STATUS',
      'LOG_MESSAGE',
      'CRITIC_EVALUATED',
      'SYNTHESIZER_START',
      'SYNTHESIS_CHUNK',
      'RESEARCH_COMPLETE',
      'RESEARCH_ERROR',
    ];

    for (const type of eventTypes) {
      eventSource.addEventListener(type, (e) => handleEvent(e as MessageEvent, type));
    }

    eventSource.onerror = () => {
      // EventSource automatically retries, or close on completion
      if (stage === 'completed' || stage === 'failed') {
        eventSource.close();
        setIsStreaming(false);
      }
    };
  }, [stage]);

  const startResearch = useCallback(
    async (query: string, maxDepth?: number): Promise<string | null> => {
      reset();
      setError(null);
      setIsStreaming(true);
      setStatusMessage('Initializing research agent...');

      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, maxDepth }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to start research task');
        }

        const data = await res.json();
        const sessionId = data.sessionId;

        setSession({
          id: sessionId,
          query,
          status: 'running',
          currentStage: 'gatekeeper',
          maxDepth: maxDepth ?? 3,
          depth: 0,
          subQueries: [],
          sources: [],
          rejectedSourceIndices: [],
          criticHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        connectToStream(sessionId);
        return sessionId;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error starting research';
        setError(msg);
        setIsStreaming(false);
        setStage('failed');
        return null;
      }
    },
    [connectToStream, reset]
  );

  return {
    session,
    stage,
    statusMessage,
    isStreaming,
    error,
    subQueries,
    sources,
    reportMarkdown,
    workers,
    logs,
    startResearch,
    stopStream,
    loadPastSession,
    reset,
  };
}
