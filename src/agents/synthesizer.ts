import { streamText } from 'ai';
import { getLLM } from '../services';
import { getSynthesizerSystemPrompt } from '../prompts';
import { logger } from '../utils';
import type { SynthesizerOptions } from '../types';
import type {
  ResearchFinding,
  ResearchState,
  ResearchStateUpdate,
} from '../state';

/**
 * Formats aggregated research findings into clean reference material for synthesis,
 * deduplicating by URL to minimize context tokens.
 */
function formatFindingsForSynthesis(findings: ResearchFinding[]): string {
  if (!findings || findings.length === 0) {
    return 'No external research findings were retrieved. Provide best effort synthesis based on verified internal knowledge while noting the absence of live sources.';
  }

  const seenUrls = new Set<string>();
  const uniqueFindings: ResearchFinding[] = [];

  for (const item of findings) {
    const urlKey = item.url ? item.url.trim().toLowerCase() : item.title;
    if (urlKey && !seenUrls.has(urlKey)) {
      seenUrls.add(urlKey);
      uniqueFindings.push(item);
    }
  }

  return uniqueFindings
    .map(
      (item, idx) =>
        `[Source ${idx + 1}]\nTitle: ${item.title}\nURL: ${item.url}\nTopic Area: "${item.query}"\nExtracted Content: ${item.content}`
    )
    .join('\n\n---\n\n');
}

/**
 * Pure synthesis function for compiling structured research reports directly in Markdown with live token streaming.
 *
 * @param query - The user's original research query
 * @param researchData - All gathered research findings across all iterations
 * @param options - Optional model configuration options
 * @returns Complete synthesized Markdown document string
 */
export async function synthesizeResearch(
  query: string,
  researchData: ResearchFinding[],
  options?: SynthesizerOptions
): Promise<string> {
  const findingsContext = formatFindingsForSynthesis(researchData);

  try {
    const result = streamText({
      model: getLLM(options?.model || options?.role || 'reasoning'),
      system: getSynthesizerSystemPrompt(),
      maxOutputTokens: options?.maxOutputTokens ?? 8192,
      prompt: `
User Original Query:
"${query}"

Total Verified Research Sources (${researchData.length}):
${findingsContext}

Synthesize all the above verified research findings into an exhaustive, authoritative, beautifully structured research report directly answering the user query.

CRITICAL CITATION RULES:
1. Place clickable inline links [Domain / Source Title](URL) directly next to every fact, statistic, metric, timeline, and key statement so the reader can click and open the source instantly.
2. NEVER use dead footnote tags or anchor numbers like [^1] or [Source 1](#source-1). Always embed the live URL: [Source Title](https://...).
3. Conclude with a complete "## References & Sources" section listing all verified sources.
`.trim(),
    });

    let fullReport = '';
    for await (const chunk of result.textStream) {
      if (options?.onChunk) {
        options.onChunk(chunk);
      }
      if (options?.sessionId) {
        try {
          const { eventDispatcher } = require('@/lib/events');
          eventDispatcher.emitEvent(options.sessionId, 'SYNTHESIS_CHUNK', { chunk });
        } catch {}
      } else if (!options?.silent) {
        process.stdout.write(chunk);
      }
      fullReport += chunk;
    }
    if (!options?.sessionId && !options?.silent) {
      process.stdout.write('\n');
    }

    const finishReason = await result.finishReason;
    if (finishReason === 'length') {
      logger.warn(
        'Synthesizer output reached the maximum token limit. The report might be truncated.'
      );
    }

    if (!fullReport.trim()) {
      throw new Error('Synthesizer agent produced an empty output.');
    }

    return fullReport;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Synthesis failed: ${errorMessage}`);
    throw new Error(`Synthesis failed: ${errorMessage}`);
  }
}

/**
 * LangGraph node handler for the Synthesizer agent.
 *
 * @param state - Current research state
 * @returns State updates containing finalReport in direct markdown
 */
export async function synthesizerNode(
  state: ResearchState
): Promise<ResearchStateUpdate> {
  const { originalQuery, researchData, depth, sessionId } = state;

  if (!sessionId) {
    logger.synthesizerStart(researchData.length, depth);
  }

  const reportMarkdown = await synthesizeResearch(
    originalQuery,
    researchData,
    { sessionId }
  );

  return {
    finalReport: reportMarkdown,
  };
}


