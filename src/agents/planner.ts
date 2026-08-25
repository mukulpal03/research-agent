import { generateText, Output } from 'ai';
import { getLLM } from '../services';
import { getPlannerSystemPrompt } from '../prompts';
import type { PlannerOptions } from '../types';
import {
  PlannerOutputSchema,
  type PlannerOutput,
  type ResearchState,
  type ResearchStateUpdate,
} from '../state';

/**
 * Pure planning function for the Planner agent.
 *
 * @param query - The original research query
 * @param options - Optional model configuration options
 * @returns Validated PlannerOutput containing strategy and search sub-queries
 */
export async function generatePlan(
  query: string,
  options?: PlannerOptions
): Promise<PlannerOutput> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error('Planner agent received an empty query.');
  }

  try {
    const { output } = await generateText({
      model: getLLM(options?.model),
      output: Output.object({
        schema: PlannerOutputSchema,
      }),
      system: getPlannerSystemPrompt(),
      prompt: `Decompose the following complex query into an optimal, non-overlapping set of search sub-queries:\n\nResearch Query: "${trimmedQuery}"`,
    });

    if (!output || !output.subQueries || output.subQueries.length === 0) {
      throw new Error('Planner agent failed to generate sub-queries.');
    }

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Planner Agent Error]: ${errorMessage}`);
    throw new Error(`Planner failed to generate research plan: ${errorMessage}`);
  }
}

/**
 * LangGraph node handler for the Planner agent.
 *
 * @param state - Current research state
 * @returns State updates containing the initial sub-queries and depth counter
 */
export async function plannerNode(
  state: ResearchState
): Promise<ResearchStateUpdate> {
  const { originalQuery } = state;

  console.log(`\n[Planner] Formulating research plan for: "${originalQuery}"`);

  const plan = await generatePlan(originalQuery);

  console.log(`[Planner] Strategy: ${plan.planExplanation}`);
  console.log(`[Planner] Generated Sub-Queries (${plan.subQueries.length}):`);
  plan.subQueries.forEach((sq, idx) => {
    console.log(`  ${idx + 1}. "${sq}"`);
  });

  return {
    subQueries: plan.subQueries,
    depth: (state.depth || 0) + 1,
  };
}
