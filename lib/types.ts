import type {
  GatekeeperOutput,
  ResearchFinding,
  CriticOutput,
  SynthesizerOutput,
} from '@/src/state';

export type ResearchStage =
  | 'idle'
  | 'gatekeeper'
  | 'planner'
  | 'researcher'
  | 'critic'
  | 'synthesizer'
  | 'completed'
  | 'failed';

export type SessionStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface CriticRoundRecord {
  depth: number;
  maxDepth: number;
  isSatisfied: boolean;
  critique?: string;
  nextSubQueries?: string[];
  purgedSourceCount?: number;
  timestamp: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  status: SessionStatus;
  currentStage: ResearchStage;
  maxDepth: number;
  depth: number;
  gatekeeper?: GatekeeperOutput;
  subQueries: string[];
  sources: ResearchFinding[];
  rejectedSourceIndices: number[];
  criticHistory: CriticRoundRecord[];
  synthesis?: SynthesizerOutput;
  finalReport?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
}

export interface WorkerStatusPayload {
  workerIndex: number;
  query: string;
  status: 'searching' | 'completed' | 'failed';
  sourcesCount?: number;
  error?: string;
}

export interface LogMessagePayload {
  message: string;
  type?: 'info' | 'success' | 'warn' | 'error';
  timestamp?: string;
}

export type SSEEventType =
  | 'SESSION_INIT'
  | 'STAGE_CHANGED'
  | 'GATEKEEPER_DONE'
  | 'PLANNER_DONE'
  | 'RESEARCHER_START'
  | 'RESEARCHER_SOURCES'
  | 'WORKER_STATUS'
  | 'LOG_MESSAGE'
  | 'CRITIC_EVALUATED'
  | 'SYNTHESIZER_START'
  | 'SYNTHESIS_CHUNK'
  | 'RESEARCH_COMPLETE'
  | 'RESEARCH_ERROR';

export interface SSEMessage<T = unknown> {
  type: SSEEventType;
  sessionId: string;
  timestamp: string;
  data: T;
}

export interface CreateResearchInput {
  query: string;
  maxDepth?: number;
}
