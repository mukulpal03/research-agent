import { generateText, Output } from "ai";
import { env } from "../config";
import { getLLM } from "../services";
import { getCriticSystemPrompt } from "../prompts";
import { logger } from "../utils";
import type { CriticOptions } from "../types";
import {
  CriticOutputSchema,
  type CriticOutput,
  type ResearchFinding,
  type ResearchState,
  type ResearchStateUpdate,
} from "../state";

/**
 * Formats research findings into a clean, contextual summary for Critic evaluation.
 */
function formatFindingsForEvaluation(findings: ResearchFinding[]): string {
  if (!findings || findings.length === 0) {
    return "No research findings retrieved yet.";
  }

  return findings
    .map(
      (item, idx) => {
        const truncatedContent = item.content.length > 400 
          ? item.content.substring(0, 400) + '...' 
          : item.content;
        return `[Source ${idx + 1}] Title: ${item.title}\nURL: ${item.url}\nQueried For: "${item.query}"\nContent: ${truncatedContent}`;
      }
    )
    .join("\n\n---\n\n");
}

/**
 * Pure evaluation function for the Critic agent.
 *
 * @param query - The user's original query
 * @param researchData - All accumulated research findings so far
 * @param currentDepth - The current iteration depth
 * @param options - Optional model configuration options
 * @returns Validated CriticOutput
 */
export async function evaluateResearchWithCritic(
  query: string,
  researchData: ResearchFinding[],
  currentDepth: number,
  options?: CriticOptions,
): Promise<CriticOutput> {
  const findingsContext = formatFindingsForEvaluation(researchData);

  try {
    const { output } = await generateText({
      model: getLLM(options?.model || options?.role || "fast"),
      output: Output.object({
        schema: CriticOutputSchema,
      }),
      system: getCriticSystemPrompt(),
      prompt: `
User Original Query:
"${query}"

Current Research Round: ${currentDepth} of ${env.MAX_DEPTH} (Max Depth)
Total Sources Gathered: ${researchData.length}

Aggregated Research Data:
${findingsContext}

Evaluate the research completeness against the original query. Decide if it is sufficient to compose an authoritative final report or if targeted follow-up queries are strictly necessary.
`.trim(),
    });

    if (!output) {
      throw new Error("Critic agent produced an empty output.");
    }

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Critic evaluation failed: ${errorMessage}`);
    throw new Error(`Critic evaluation failed: ${errorMessage}`);
  }
}

/**
 * LangGraph node handler for the Critic agent.
 * Enforces strict budget caps on recursion depth and search breadth.
 *
 * @param state - Current research state
 * @returns State updates with critic evaluation, updated satisfaction flag, and next queries/depth
 */
export async function criticNode(
  state: ResearchState,
): Promise<ResearchStateUpdate> {
  const { originalQuery, researchData, depth, sessionId } = state;

  if (!researchData || researchData.length === 0) {
    throw new Error('Oops! Looks like the Tavily free limit is exhausted. Please contact Mukul :)');
  }

  const criticResult = await evaluateResearchWithCritic(
    originalQuery,
    researchData,
    depth,
  );

  let updatedResearchData = researchData;
  let purgedCount = 0;
  if (
    criticResult.rejectedSourceIndices &&
    criticResult.rejectedSourceIndices.length > 0
  ) {
    const rejectedSet = new Set(criticResult.rejectedSourceIndices);
    // idx + 1 because the prompt labels sources starting at 1
    updatedResearchData = researchData.filter(
      (_, idx) => !rejectedSet.has(idx + 1)
    );
    purgedCount = researchData.length - updatedResearchData.length;
  }

  // 1. Check if Max Recursion Depth is reached (Strict Hard Limit)
  if (depth >= env.MAX_DEPTH) {
    if (!sessionId) {
      logger.criticMaxDepthReached(env.MAX_DEPTH, updatedResearchData.length);
    }

    return {
      critic: {
        ...criticResult,
        isSatisfied: true,
        nextSubQueries: [],
      },
      isSatisfied: true,
      researchData: updatedResearchData,
    };
  }

  const constrainedSubQueries = (criticResult.nextSubQueries || []).slice(0, 3);

  if (!sessionId) {
    logger.criticEvaluation(
      depth,
      env.MAX_DEPTH,
      criticResult.isSatisfied,
      criticResult.critique,
      constrainedSubQueries,
      purgedCount
    );
  }

  // 2. If Critic is satisfied with the information
  if (criticResult.isSatisfied) {
    return {
      critic: {
        ...criticResult,
        nextSubQueries: [],
      },
      isSatisfied: true,
      researchData: updatedResearchData,
    };
  }

  // 3. If Critic found gaps and budget allows recursion
  return {
    critic: {
      ...criticResult,
      nextSubQueries: constrainedSubQueries,
    },
    isSatisfied: false,
    subQueries: constrainedSubQueries,
    depth: depth + 1,
    researchData: updatedResearchData,
  };
}

