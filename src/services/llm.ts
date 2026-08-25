import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '../config';

/**
 * Centralized Amazon Bedrock provider instance configured with AWS credentials
 */
export const bedrock = createAmazonBedrock({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  sessionToken: env.AWS_SESSION_TOKEN,
});

/**
 * Centralized OpenAI provider instance (alternative/fallback)
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY || '',
});

/**
 * Helper to get the configured language model instance based on LLM_PROVIDER
 *
 * @param modelName - Optional model override
 * @returns LanguageModel instance
 */
export function getLLM(modelName?: string) {
  if (env.LLM_PROVIDER === 'bedrock') {
    return bedrock(modelName || env.BEDROCK_MODEL);
  }

  return openai(modelName || env.OPENAI_MODEL);
}
