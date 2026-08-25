import { z } from 'zod';

/**
 * 1. Gatekeeper Agent Schema
 * Evaluates whether a query needs full recursive research or can be answered directly.
 * Note: Uses nullable() instead of optional() to ensure full compatibility with OpenAI Strict JSON Schema.
 */
export const GatekeeperOutputSchema = z.object({
  decision: z
    .enum(['direct_answer', 'research_required'])
    .describe('Whether the query requires deep multi-agent web research or a quick direct answer'),
  reasoning: z
    .string()
    .describe('Clear justification for the triage routing decision'),
  directResponse: z
    .string()
    .nullish()
    .describe('Direct response to provide to user if decision is direct_answer; null if research_required'),
});

export type GatekeeperOutput = z.infer<typeof GatekeeperOutputSchema>;

/**
 * 2. Planner Agent Schema
 * Decomposes a complex topic into distinct sub-questions for parallel research.
 */
export const PlannerOutputSchema = z.object({
  planExplanation: z
    .string()
    .describe('High-level research strategy explaining how the sub-queries address the core problem'),
  subQueries: z
    .array(z.string())
    .min(1, 'At least 1 sub-query must be generated')
    .max(5, 'Maximum 5 sub-queries per research phase to preserve budget')
    .describe('Distinct, targeted sub-queries to execute search on'),
});

export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

/**
 * 3. Researcher Finding (Structured Search Result)
 * Normalized structured representation of research data from Tavily / web search.
 */
export const ResearchFindingSchema = z.object({
  query: z.string().describe('The sub-query searched for'),
  title: z.string().describe('Title of the source webpage or article'),
  url: z.string().describe('URL reference of the source'),
  content: z.string().describe('Relevant extracted summary / factual content'),
  publishedDate: z
    .string()
    .nullable()
    .describe('Publication date if available, otherwise null'),
});

export type ResearchFinding = z.infer<typeof ResearchFindingSchema>;

/**
 * 4. Critic Agent Schema
 * Evaluates aggregated research findings against original query and identifies data gaps.
 */
export const CriticOutputSchema = z.object({
  isSatisfied: z
    .boolean()
    .describe('True if gathered research sufficiently and thoroughly answers the original query; False if critical gaps remain'),
  critique: z
    .string()
    .describe('Detailed critical evaluation of findings against user requirements'),
  missingAspects: z
    .array(z.string())
    .describe('Specific missing data points, facts, or unanswered angles'),
  nextSubQueries: z
    .array(z.string())
    .describe('Targeted follow-up search queries to resolve missing gaps (empty array if isSatisfied is true)'),
  rejectedSourceIndices: z
    .array(z.number())
    .describe('1-based indices of any sources from the current research data that are irrelevant, hallucinatory, or completely off-topic. These will be removed from the context.'),
});

export type CriticOutput = z.infer<typeof CriticOutputSchema>;

/**
 * 5. Synthesizer Agent Schema
 * Structured final comprehensive research report.
 */
export const SynthesizerSectionSchema = z.object({
  heading: z.string().describe('Section header title'),
  content: z.string().describe('Synthesized analysis in markdown format'),
  sourcesUsed: z.array(z.string()).describe('List of URLs cited in this specific section'),
});

export const SynthesizerOutputSchema = z.object({
  title: z.string().describe('Title of the comprehensive research report'),
  executiveSummary: z.string().describe('High-level executive summary of key findings'),
  sections: z
    .array(SynthesizerSectionSchema)
    .min(1, 'Report must contain at least one section')
    .describe('Structured deep-dive sections'),
  keyTakeaways: z
    .array(z.string())
    .describe('Bullet point summary of critical takeaways and conclusions'),
});

export type SynthesizerOutput = z.infer<typeof SynthesizerOutputSchema>;
export type SynthesizerSection = z.infer<typeof SynthesizerSectionSchema>;
