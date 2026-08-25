import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../config";

/**
 * Native Bedrock provider (Converse API) — required for Anthropic models
 * which don't support the OpenAI-compatible Mantle chat/responses endpoints.
 */
const bedrockNative = createAmazonBedrock({
  region: env.AWS_REGION,
  apiKey: env.BEDROCK_API_KEY,
});

/**
 * Bedrock Mantle provider (OpenAI-compatible API) — for all other models
 * (Mistral, OpenAI, DeepSeek, Qwen, Google, etc.)
 */
const bedrockMantle = createBedrockMantle({
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
 * Model prefixes that require the native Bedrock Converse API
 * instead of the OpenAI-compatible Mantle endpoint.
 */
const NATIVE_API_PREFIXES = ["anthropic."];

/**
 * Helper to get the configured language model instance based on LLM_PROVIDER.
 * Automatically routes Anthropic models through the native Bedrock API
 * and all other Bedrock models through the Mantle (OpenAI-compatible) API.
 *
 * @param modelName - Optional model override
 * @returns LanguageModel instance
 */
export function getLLM(modelName?: string) {
  if (env.LLM_PROVIDER === "bedrock") {
    const model = modelName || env.BEDROCK_MODEL;
    const useNative = NATIVE_API_PREFIXES.some((p) => model.startsWith(p));
    return useNative ? bedrockNative(model) : bedrockMantle(model);
  }

  return openai(modelName || env.OPENAI_MODEL);
}

