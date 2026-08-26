import { NextResponse } from 'next/server';
import { env } from '@/src/config';
import { getActiveModelName } from '@/src/services';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    provider: env.LLM_PROVIDER,
    maxDepth: env.MAX_DEPTH,
    maxResultsPerQuery: env.MAX_RESULTS_PER_QUERY,
    concurrencyLimit: env.CONCURRENCY_LIMIT,
    fastModel: getActiveModelName('fast'),
    reasoningModel: getActiveModelName('reasoning'),
  });
}
