import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { env } from './config';
import { researchWorkflow } from './graph';
import { getActiveModelName } from './services';
import { logger, colors as c } from './utils';

/**
 * Executes a research query through the LangGraph workflow.
 *
 * @param query - Input question or topic
 */
export async function runResearch(query: string) {
  logger.researchGoal(query);

  const finalState = await researchWorkflow.invoke({
    originalQuery: query,
  });

  if (finalState.finalReport) {
    if (finalState.gatekeeper?.decision === 'direct_answer') {
      console.log(`\n${c.green}╭── 💬 DIRECT ANSWER ───────────────────────────────────────────────────${c.reset}`);
      console.log(finalState.finalReport);
      console.log(`${c.green}╰────────────────────────────────────────────────────────────────────────${c.reset}\n`);
    } else {
      const randomId = Math.floor(Math.random() * 1000000);
      const filename = `report-${randomId}.md`;
      const filePath = path.join(process.cwd(), filename);
      
      fs.writeFileSync(filePath, finalState.finalReport);
      logger.reportSaved(filename, filePath);
    }
  }

  logger.workflowComplete({
    decision: finalState.gatekeeper?.decision,
    finalDepth: finalState.depth,
    maxDepth: env.MAX_DEPTH,
    totalSources: finalState.researchData?.length,
    isSatisfied: finalState.critic?.isSatisfied,
  });

  return finalState;
}

async function main() {
  const fastModel = getActiveModelName('fast');
  const reasoningModel = getActiveModelName('reasoning');

  logger.banner(env.LLM_PROVIDER, fastModel, reasoningModel, env.MAX_DEPTH);

  // 1. Check if query was provided via CLI arguments (e.g. pnpm dev "what is x?")
  const cliArgsQuery = process.argv.slice(2).join(' ').trim();
  if (cliArgsQuery) {
    await runResearch(cliArgsQuery);
    return;
  }

  // 2. Otherwise, prompt the user interactively in the terminal
  const rl = readline.createInterface({ input, output });

  try {
    const userQuery = await rl.question(`${c.bold}${c.brightCyan}❓ Enter your research query:${c.reset} `);
    const trimmed = userQuery.trim();

    if (!trimmed) {
      logger.warn('No query provided. Exiting.');
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
    logger.error(`Fatal execution error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}

