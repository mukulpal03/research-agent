import { env } from './config';

async function main() {
  console.log('🚀 Research Agent System initialized');
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`OpenAI Model: ${env.OPENAI_MODEL}`);
  console.log(`Max Recursion Depth: ${env.MAX_DEPTH}`);
}

main().catch((err) => {
  console.error('Fatal error in Research Agent:', err);
  process.exit(1);
});
