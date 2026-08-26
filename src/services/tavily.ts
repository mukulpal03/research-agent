import { tavily, type TavilyClient } from '@tavily/core';
import { env } from '../config';
import { logger } from '../utils';
import type { ResearchFinding } from '../schemas';

/**
 * Centralized Tavily Search Client
 */
export const tavilyClient: TavilyClient = tavily({
  apiKey: env.TAVILY_API_KEY,
});

/**
 * Executes a search query via Tavily and normalizes results into structured ResearchFinding objects.
 *
 * @param query - The targeted sub-query string to search
 * @param maxResults - Maximum number of search results to return (default: 3)
 * @returns Array of structured ResearchFinding objects
 */
export async function searchTavily(
  query: string,
  maxResults: number = 3
): Promise<ResearchFinding[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  try {
    const response = await tavilyClient.search(trimmedQuery, {
      maxResults,
      searchDepth: 'advanced',
    });

    if (!response.results || response.results.length === 0) {
      logger.warn(`No search results found for: "${trimmedQuery}"`);
      return [];
    }

    return response.results.map((result) => ({
      query: trimmedQuery,
      title: result.title || 'Untitled Source',
      url: result.url || '',
      content: (result.content || '').trim(),
      publishedDate: result.publishedDate || null,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lower = errorMessage.toLowerCase();

    const isLimitOrQuotaError =
      lower.includes('limit') ||
      lower.includes('quota') ||
      lower.includes('credit') ||
      lower.includes('rate') ||
      lower.includes('429') ||
      lower.includes('432') ||
      lower.includes('403') ||
      lower.includes('unauthorized') ||
      lower.includes('forbidden') ||
      lower.includes('plan');

    if (isLimitOrQuotaError) {
      const friendlyMsg = 'Oops! Looks like the Tavily free limit is exhausted. Please contact Mukul :)';
      logger.error(`Tavily API limit error: ${errorMessage}`);
      throw new Error(friendlyMsg);
    }

    logger.error(`Search error for "${trimmedQuery}": ${errorMessage}`);
    return [];
  }
}

