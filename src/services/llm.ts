import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createBedrockMantle } from "@ai-sdk/amazon-bedrock/mantle";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../config";
import type { ModelRole } from "../types";

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
 * Resolves the configured model name dynamically based on provider and role/override.
 *
 * @param modelOrRole - 'fast', 'reasoning', or a specific model name override
 * @returns Resolved model identifier string
 */
export function getActiveModelName(modelOrRole: ModelRole | string = "reasoning"): string {
  if (modelOrRole === "fast") {
    return env.LLM_PROVIDER === "bedrock"
      ? env.BEDROCK_FAST_MODEL
      : env.OPENAI_FAST_MODEL;
  }

  if (modelOrRole === "reasoning") {
    return env.LLM_PROVIDER === "bedrock"
      ? env.BEDROCK_REASONING_MODEL
      : env.OPENAI_REASONING_MODEL;
  }

  return modelOrRole;
}

/**
 * Helper to get the configured language model instance based on LLM_PROVIDER.
 * Supports role-based selection ('fast' vs 'reasoning') or specific model overrides.
 * Automatically routes Anthropic models through the native Bedrock API
 * and all other Bedrock models through the Mantle (OpenAI-compatible) API.
 *
 * @param modelOrRole - Optional model override or role ('fast' | 'reasoning')
 * @returns LanguageModel instance
 */
export function getLLM(modelOrRole: ModelRole | string = "reasoning") {
  const model = getActiveModelName(modelOrRole);

  if (env.LLM_PROVIDER === "bedrock") {
    const useNative = NATIVE_API_PREFIXES.some((p) => model.startsWith(p));
    return useNative ? bedrockNative(model) : bedrockMantle(model);
  }

  return openai(model);
}

/**
 * Convenience helper for fast / non-reasoning agent tasks (Gatekeeper, Planner, Triage, Extraction)
 */
export function getFastLLM(modelOverride?: string) {
  return getLLM(modelOverride || "fast");
}

/**
 * Convenience helper for deep reasoning tasks (Synthesizer, Deep Analysis)
 */
export function getReasoningLLM(modelOverride?: string) {
  return getLLM(modelOverride || "reasoning");
}

