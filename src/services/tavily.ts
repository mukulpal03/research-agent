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
      searchDepth: 'basic',
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
    logger.error(`Search error for "${trimmedQuery}": ${errorMessage}`);
    return [];
  }
}

