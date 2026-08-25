import { generateText, Output } from "ai";
import { env } from "../config";
import { getLLM } from "../services";
import { getCriticSystemPrompt } from "../prompts";
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
      (item, idx) =>
        `[Source ${idx + 1}] Title: ${item.title}\nURL: ${item.url}\nQueried For: "${item.query}"\nContent: ${item.content}`,
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
      model: getLLM(options?.model),
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
    console.error(`[Critic Agent Error]: ${errorMessage}`);
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
  const { originalQuery, researchData, depth } = state;

  console.log(
    `\n[Critic Node] Evaluating ${researchData.length} research finding(s) at Depth ${depth}/${env.MAX_DEPTH}...`,
  );

  const criticResult = await evaluateResearchWithCritic(
    originalQuery,
    researchData,
    depth,
  );

  console.log(`[Critic] Critique: ${criticResult.critique}`);
  console.log(`[Critic] Is Satisfied: ${criticResult.isSatisfied}`);

  let updatedResearchData = researchData;
  if (criticResult.rejectedSourceUrls && criticResult.rejectedSourceUrls.length > 0) {
    const rejectedSet = new Set(criticResult.rejectedSourceUrls);
    updatedResearchData = researchData.filter(f => !f.url || !rejectedSet.has(f.url));
    const removedCount = researchData.length - updatedResearchData.length;
    if (removedCount > 0) {
      console.log(`[Critic] 🗑️ Garbage Collection: Removed ${removedCount} irrelevant source(s) from the context.`);
    }
  }

  // 1. Check if Max Recursion Depth is reached (Strict Hard Limit)
  if (depth >= env.MAX_DEPTH) {
    console.log(
      `[Critic] 🛑 Max recursion depth (${env.MAX_DEPTH}) reached. Halting recursion.`,
    );

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

  // 2. If Critic is satisfied with the information
  if (criticResult.isSatisfied) {
    console.log(`[Critic] ✅ Research is complete and sufficient.`);
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
  // Enforce breadth control: Max 3 follow-up queries to prevent token explosions
  const constrainedSubQueries = (criticResult.nextSubQueries || []).slice(0, 3);

  console.log(
    `[Critic] 🔄 Identified gaps. Requesting ${constrainedSubQueries.length} follow-up sub-queries for Round ${depth + 1}:`,
  );
  constrainedSubQueries.forEach((q, i) => {
    console.log(`  ${i + 1}. "${q}"`);
  });

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
