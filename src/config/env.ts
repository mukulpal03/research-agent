import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z
    .string({ message: 'OPENAI_API_KEY is required in environment or .env file' })
    .min(1, 'OPENAI_API_KEY cannot be empty'),

  TAVILY_API_KEY: z
    .string({ message: 'TAVILY_API_KEY is required in environment or .env file' })
    .min(1, 'TAVILY_API_KEY cannot be empty'),

  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  MAX_DEPTH: z.coerce
    .number()
    .int('MAX_DEPTH must be an integer')
    .min(1, 'MAX_DEPTH must be at least 1')
    .default(2),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
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
