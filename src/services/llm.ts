import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../config";

/**
 * Centralized Bedrock Mantle provider instance (OpenAI-compatible Bedrock API)
 */
export const bedrock = createBedrockMantle({
  baseURL: env.BEDROCK_BASE_URL,
  apiKey: env.BEDROCK_API_KEY,
});

/**
 * Centralized OpenAI provider instance (alternative/fallback)
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY || "",
});

/**
 * Helper to get the configured language model instance based on LLM_PROVIDER
 *
 * @param modelName - Optional model override
 * @returns LanguageModel instance
 */
export function getLLM(modelName?: string) {
  if (env.LLM_PROVIDER === "bedrock") {
    return bedrock(modelName || env.BEDROCK_MODEL);
  }

  return openai(modelName || env.OPENAI_MODEL);
}

