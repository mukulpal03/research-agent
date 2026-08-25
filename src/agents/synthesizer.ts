import { generateText, Output } from 'ai';
import { getLLM } from '../services';
import { getSynthesizerSystemPrompt } from '../prompts';
import type { SynthesizerOptions } from '../types';
import {
  SynthesizerOutputSchema,
  type SynthesizerOutput,
  type ResearchFinding,
  type ResearchState,
  type ResearchStateUpdate,
} from '../state';

/**
 * Formats aggregated research findings into clean reference material for synthesis.
 */
function formatFindingsForSynthesis(findings: ResearchFinding[]): string {
  if (!findings || findings.length === 0) {
    return 'No external research findings were retrieved. Provide best effort synthesis based on verified internal knowledge while noting the absence of live sources.';
  }

  return findings
    .map(
      (item, idx) =>
        `[Source ${idx + 1}]\nTitle: ${item.title}\nURL: ${item.url}\nTopic Area: "${item.query}"\nExtracted Content: ${item.content}`
    )
    .join('\n\n---\n\n');
}

/**
 * Pure synthesis function for compiling structured research reports.
 *
 * @param query - The user's original research query
 * @param researchData - All gathered research findings across all iterations
 * @param options - Optional model configuration options
 * @returns Validated SynthesizerOutput containing structured sections and full markdown
 */
export async function synthesizeResearch(
  query: string,
  researchData: ResearchFinding[],
  options?: SynthesizerOptions
): Promise<SynthesizerOutput> {
  const findingsContext = formatFindingsForSynthesis(researchData);

  try {
    const { output } = await generateText({
      model: getLLM(options?.model),
      output: Output.object({
        schema: SynthesizerOutputSchema,
      }),
      system: getSynthesizerSystemPrompt(),
      prompt: `
User Original Query:
"${query}"

Total Gathered Research Sources (${researchData.length}):
${findingsContext}

Synthesize all the above verified research findings into a comprehensive, authoritative research report directly answering the user query. Include inline citations and complete markdown formatting.
`.trim(),
    });

    if (!output) {
      throw new Error('Synthesizer agent produced an empty output.');
    }

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Synthesizer Agent Error]: ${errorMessage}`);
    throw new Error(`Synthesis failed: ${errorMessage}`);
  }
}

/**
 * LangGraph node handler for the Synthesizer agent.
 *
 * @param state - Current research state
 * @returns State updates containing structured synthesis and finalReport
 */
export async function synthesizerNode(
  state: ResearchState
): Promise<ResearchStateUpdate> {
  const { originalQuery, researchData, depth } = state;

  console.log(
    `\n[Synthesizer Node] Compiling final research report from ${researchData.length} sources (Completed after ${depth} round(s))...`
  );

  const synthesisResult = await synthesizeResearch(
    originalQuery,
    researchData
  );

  console.log(`[Synthesizer] Report Title: "${synthesisResult.title}"`);
  console.log(`[Synthesizer] Generated ${synthesisResult.sections.length} deep-dive section(s).`);

  const report = [
    `# ${synthesisResult.title}`,
    `## Executive Summary\n${synthesisResult.executiveSummary}`,
    ...synthesisResult.sections.map(s => {
      const resolvedSources = s.sourcesUsed.map(src => {
        const match = src.match(/Source\s*(\d+)/i);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          return researchData[idx]?.url || src;
        }
        return src;
      });
      const uniqueSources = [...new Set(resolvedSources)];
      return `## ${s.heading}\n${s.content}\n\n*Sources:*\n${uniqueSources.map(url => `- ${url}`).join('\n')}`;
    }),
    `## Key Takeaways\n${synthesisResult.keyTakeaways.map(t => `- ${t}`).join('\n')}`
  ].join('\n\n');

  return {
    synthesis: synthesisResult,
    finalReport: report,
  };
}
