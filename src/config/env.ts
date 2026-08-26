import { z } from 'zod';

if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    const dotenv = require('dotenv');
    dotenv.config();
  } catch {}
}

const envSchema = z
  .object({
    LLM_PROVIDER: z
      .enum(['bedrock', 'openai'])
      .default('bedrock'),

    // AWS Bedrock Configuration
    BEDROCK_API_KEY: z.string().optional(),
    BEDROCK_BASE_URL: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    BEDROCK_FAST_MODEL: z.string().optional(),
    BEDROCK_REASONING_MODEL: z.string().optional(),

    // OpenAI Configuration (Fallback/Alternative)
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_FAST_MODEL: z.string().optional(),
    OPENAI_REASONING_MODEL: z.string().optional(),

    // Search Configuration
    TAVILY_API_KEY: z.string().optional(),

    // General Runtime
    MAX_DEPTH: z.coerce
      .number()
      .int('MAX_DEPTH must be an integer')
      .min(1, 'MAX_DEPTH must be at least 1')
      .default(2),
    CONCURRENCY_LIMIT: z.coerce
      .number()
      .int('CONCURRENCY_LIMIT must be an integer')
      .min(1, 'CONCURRENCY_LIMIT must be at least 1')
      .default(5),
    MAX_RESULTS_PER_QUERY: z.coerce
      .number()
      .int()
      .min(1)
      .default(3),

    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .transform((data) => {
    const bedrockFast = process.env.BEDROCK_FAST_MODEL || data.BEDROCK_FAST_MODEL || '';
    const bedrockReasoning = process.env.BEDROCK_REASONING_MODEL || data.BEDROCK_REASONING_MODEL || '';
    const openaiFast = process.env.OPENAI_FAST_MODEL || data.OPENAI_FAST_MODEL || '';
    const openaiReasoning = process.env.OPENAI_REASONING_MODEL || data.OPENAI_REASONING_MODEL || '';

    return {
      ...data,
      BEDROCK_FAST_MODEL: bedrockFast,
      BEDROCK_REASONING_MODEL: bedrockReasoning,
      OPENAI_FAST_MODEL: openaiFast,
      OPENAI_REASONING_MODEL: openaiReasoning,
    };
  })
  .superRefine((data, ctx) => {
    if (data.LLM_PROVIDER === 'bedrock') {
      if (!data.BEDROCK_API_KEY || data.BEDROCK_API_KEY.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'BEDROCK_API_KEY is required when LLM_PROVIDER is set to "bedrock"',
          path: ['BEDROCK_API_KEY'],
        });
      }
      if (!data.BEDROCK_FAST_MODEL || data.BEDROCK_FAST_MODEL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'BEDROCK_FAST_MODEL is required in environment variables when LLM_PROVIDER is set to "bedrock"',
          path: ['BEDROCK_FAST_MODEL'],
        });
      }
      if (!data.BEDROCK_REASONING_MODEL || data.BEDROCK_REASONING_MODEL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'BEDROCK_REASONING_MODEL is required in environment variables when LLM_PROVIDER is set to "bedrock"',
          path: ['BEDROCK_REASONING_MODEL'],
        });
      }
    }

    if (data.LLM_PROVIDER === 'openai') {
      if (!data.OPENAI_API_KEY || data.OPENAI_API_KEY.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OPENAI_API_KEY is required when LLM_PROVIDER is set to "openai"',
          path: ['OPENAI_API_KEY'],
        });
      }
      if (!data.OPENAI_FAST_MODEL || data.OPENAI_FAST_MODEL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OPENAI_FAST_MODEL is required in environment variables when LLM_PROVIDER is set to "openai"',
          path: ['OPENAI_FAST_MODEL'],
        });
      }
      if (!data.OPENAI_REASONING_MODEL || data.OPENAI_REASONING_MODEL.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OPENAI_REASONING_MODEL is required in environment variables when LLM_PROVIDER is set to "openai"',
          path: ['OPENAI_REASONING_MODEL'],
        });
      }
    }

    if (!data.TAVILY_API_KEY || data.TAVILY_API_KEY.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TAVILY_API_KEY is required',
        path: ['TAVILY_API_KEY'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // If during next build or type checking, provide safe fallback structure
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build') {
      return {
        LLM_PROVIDER: (process.env.LLM_PROVIDER as any) || 'bedrock',
        BEDROCK_API_KEY: process.env.BEDROCK_API_KEY || '',
        BEDROCK_BASE_URL: process.env.BEDROCK_BASE_URL || '',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
        BEDROCK_FAST_MODEL: process.env.BEDROCK_FAST_MODEL || '',
        BEDROCK_REASONING_MODEL: process.env.BEDROCK_REASONING_MODEL || '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        OPENAI_FAST_MODEL: process.env.OPENAI_FAST_MODEL || '',
        OPENAI_REASONING_MODEL: process.env.OPENAI_REASONING_MODEL || '',
        TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
        MAX_DEPTH: 3,
        CONCURRENCY_LIMIT: 5,
        MAX_RESULTS_PER_QUERY: 3,
        NODE_ENV: 'production',
      };
    }

    const errorDetails = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    const errorMessage = `❌ [Environment Configuration Error] Invalid or missing environment variables:\n${errorDetails}\n\nPlease check your .env file or reference .env.example.`;

    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return result.data;
}

export const env = validateEnv();
