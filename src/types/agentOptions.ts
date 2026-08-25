export type ModelRole = 'fast' | 'reasoning';

/**
 * Common configuration options for LLM-based agent executions
 */
export interface AgentExecutionOptions {
  model?: string;
  role?: ModelRole;
}

export type GatekeeperOptions = AgentExecutionOptions;
export type PlannerOptions = AgentExecutionOptions;
export type CriticOptions = AgentExecutionOptions;
export type SynthesizerOptions = AgentExecutionOptions;

/**
 * Options for Researcher execution
 */
export interface ResearcherOptions {
  maxResults?: number;
}
