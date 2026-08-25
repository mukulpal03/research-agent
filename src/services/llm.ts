import { createOpenAI } from '@ai-sdk/openai';
import { env } from '../config';

/**
 * Centralized OpenAI provider instance configured with environment variables
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Helper to get a configured language model instance
 *
 * @param modelName - Optional model override (defaults to env.OPENAI_MODEL)
 * @returns LanguageModel instance
 */
export function getLLM(modelName?: string) {
  return openai(modelName || env.OPENAI_MODEL);
}
