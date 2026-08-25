import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    LLM_PROVIDER: z
      .enum(['bedrock', 'openai'])
      .default('bedrock'),

    // AWS Bedrock Configuration
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_SESSION_TOKEN: z.string().optional(),
    BEDROCK_MODEL: z
      .string()
      .default('anthropic.claude-3-5-sonnet-20241022-v2:0'),

    // OpenAI Configuration (Fallback/Alternative)
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),

    // Search Configuration
    TAVILY_API_KEY: z
      .string({ message: 'TAVILY_API_KEY is required in environment or .env file' })
      .min(1, 'TAVILY_API_KEY cannot be empty'),

    // General Runtime
    MAX_DEPTH: z.coerce
      .number()
      .int('MAX_DEPTH must be an integer')
      .min(1, 'MAX_DEPTH must be at least 1')
      .default(2),

    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .superRefine((data, ctx) => {
    if (data.LLM_PROVIDER === 'openai' && (!data.OPENAI_API_KEY || data.OPENAI_API_KEY.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'OPENAI_API_KEY is required when LLM_PROVIDER is set to "openai"',
        path: ['OPENAI_API_KEY'],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
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
