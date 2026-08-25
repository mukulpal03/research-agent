/**
 * Common configuration options for agent executions
 */
export interface AgentExecutionOptions {
  model?: string;
}

export type GatekeeperOptions = AgentExecutionOptions;
export type PlannerOptions = AgentExecutionOptions;
export type CriticOptions = AgentExecutionOptions;
export type SynthesizerOptions = AgentExecutionOptions;
