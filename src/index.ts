import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { env } from './config';
import { researchWorkflow } from './graph';

/**
 * Executes a research query through the LangGraph workflow.
 *
 * @param query - Input question or topic
 */
export async function runResearch(query: string) {
  console.log(`\n========================================`);
  console.log(`🔎 Starting Research Workflow`);
  console.log(`Query: "${query}"`);
  console.log(`========================================`);

  const finalState = await researchWorkflow.invoke({
    originalQuery: query,
  });

  console.log(`\n========================================`);
  console.log(`🏁 Workflow Execution Completed`);
  console.log(`========================================`);

  if (finalState.gatekeeper) {
    console.log(`Gatekeeper Decision: ${finalState.gatekeeper.decision}`);
    console.log(`Gatekeeper Reasoning: ${finalState.gatekeeper.reasoning}`);
  }

  if (finalState.critic) {
    console.log(`\n🧐 Critic Evaluation:`);
    console.log(`  - Is Satisfied: ${finalState.critic.isSatisfied}`);
    console.log(`  - Critique: ${finalState.critic.critique}`);
    console.log(`  - Final Depth Reached: ${finalState.depth}/${env.MAX_DEPTH}`);
  }

  if (finalState.researchData && finalState.researchData.length > 0) {
    console.log(`\n📚 Total Research Findings Gathered: ${finalState.researchData.length} source(s)`);
  }

  if (finalState.finalReport) {
    console.log(`\n--- Final Response ---`);
    console.log(finalState.finalReport);
  }

  return finalState;
}

async function main() {
  const activeModel =
    env.LLM_PROVIDER === 'bedrock' ? env.BEDROCK_MODEL : env.OPENAI_MODEL;

  console.log('🚀 Deep Research Agent System Initialized');
  console.log(
    `Provider: ${env.LLM_PROVIDER} | Model: ${activeModel} | Max Depth: ${env.MAX_DEPTH}`
  );

  // 1. Check if query was provided via CLI arguments (e.g. pnpm dev "what is x?")
  const cliArgsQuery = process.argv.slice(2).join(' ').trim();
  if (cliArgsQuery) {
    await runResearch(cliArgsQuery);
    return;
  }

  // 2. Otherwise, prompt the user interactively in the terminal
  const rl = readline.createInterface({ input, output });

  try {
    const userQuery = await rl.question('\n❓ Enter your research query: ');
    const trimmed = userQuery.trim();

    if (!trimmed) {
      console.log('⚠️  No query provided. Exiting.');
      return;
    }

    await runResearch(trimmed);
  } finally {
    rl.close();
  }
}

// Run main only when executing directly
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
