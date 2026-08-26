export type ModelRole = 'fast' | 'reasoning';

/**
 * Common configuration options for LLM-based agent executions
 */
export interface AgentExecutionOptions {
  model?: string;
  role?: ModelRole;
  maxOutputTokens?: number;
}

export type GatekeeperOptions = AgentExecutionOptions;
export type PlannerOptions = AgentExecutionOptions;
export type CriticOptions = AgentExecutionOptions;
export interface SynthesizerOptions extends AgentExecutionOptions {
  onChunk?: (chunk: string) => void;
  sessionId?: string;
  silent?: boolean;
}

/**
 * Options for Researcher execution
 */
export interface ResearcherOptions {
  maxResults?: number;
}
