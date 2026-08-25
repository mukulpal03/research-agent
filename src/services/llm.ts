import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../config";
import type { ModelRole } from "../types";

/**
 * Native Bedrock provider
 */
const bedrock = createAmazonBedrock({
  region: env.AWS_REGION,
  apiKey: env.BEDROCK_API_KEY,
});

/**
 * Centralized OpenAI provider instance (alternative/fallback)
 */
export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY || "",
});

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
 *
 * @param modelOrRole - Optional model override or role ('fast' | 'reasoning')
 * @returns LanguageModel instance
 */
export function getLLM(modelOrRole: ModelRole | string = "reasoning") {
  const model = getActiveModelName(modelOrRole);

  if (env.LLM_PROVIDER === "bedrock") {
    return bedrock(model);
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

