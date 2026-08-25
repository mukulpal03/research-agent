import { generateText, Output } from 'ai';
import { getLLM } from '../services';
import { getGatekeeperSystemPrompt } from '../prompts';
import { logger } from '../utils';
import type { GatekeeperOptions } from '../types';
import {
  GatekeeperOutputSchema,
  type GatekeeperOutput,
  type ResearchState,
  type ResearchStateUpdate,
} from '../state';

/**
 * Pure evaluation function for the Gatekeeper agent.
 *
 * @param query - The user's input prompt
 * @param options - Optional model configuration options
 * @returns Validated GatekeeperOutput object
 */
export async function evaluateQueryWithGatekeeper(
  query: string,
  options?: GatekeeperOptions
): Promise<GatekeeperOutput> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      decision: 'direct_answer',
      reasoning: 'Empty or whitespace-only query provided.',
      directResponse: 'Please provide a valid research question or topic to get started.',
    };
  }

  try {
    const { output } = await generateText({
      model: getLLM(options?.model || options?.role || 'fast'),
      output: Output.object({
        schema: GatekeeperOutputSchema,
      }),
      system: getGatekeeperSystemPrompt(),
      prompt: `Analyze the following user query and decide if it requires deep research or an immediate direct response:\n\nUser Query: "${trimmedQuery}"`,
    });

    if (!output) {
      throw new Error('Gatekeeper agent produced an empty output.');
    }

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Gatekeeper evaluation failed: ${errorMessage}`);
    throw new Error(`Gatekeeper evaluation failed: ${errorMessage}`);
  }
}

/**
 * LangGraph node handler for the Gatekeeper agent.
 *
 * @param state - Current research state
 * @returns State updates with gatekeeper decision and optional finalReport for direct answers
 */
export async function gatekeeperNode(
  state: ResearchState
): Promise<ResearchStateUpdate> {
  const { originalQuery } = state;

  const gatekeeperResult = await evaluateQueryWithGatekeeper(originalQuery);

  logger.gatekeeper(gatekeeperResult.decision, gatekeeperResult.reasoning);

  if (gatekeeperResult.decision === 'direct_answer') {
    return {
      gatekeeper: gatekeeperResult,
      finalReport:
        gatekeeperResult.directResponse ||
        'I am ready to help you with your research questions.',
    };
  }

  return {
    gatekeeper: gatekeeperResult,
  };
}

