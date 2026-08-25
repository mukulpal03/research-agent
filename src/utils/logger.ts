/**
 * Sleek Terminal Styling & Logger Utility for Deep Research Agent
 */

const ESC = '\x1b[';

export const colors = {
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: `${ESC}2m`,
  italic: `${ESC}3m`,
  underline: `${ESC}4m`,

  // Colors
  black: `${ESC}30m`,
  red: `${ESC}31m`,
  green: `${ESC}32m`,
  yellow: `${ESC}33m`,
  blue: `${ESC}34m`,
  magenta: `${ESC}35m`,
  cyan: `${ESC}36m`,
  white: `${ESC}37m`,
  gray: `${ESC}90m`,

  // Bright
  brightRed: `${ESC}91m`,
  brightGreen: `${ESC}92m`,
  brightYellow: `${ESC}93m`,
  brightBlue: `${ESC}94m`,
  brightMagenta: `${ESC}95m`,
  brightCyan: `${ESC}96m`,
  brightWhite: `${ESC}97m`,

  // Backgrounds
  bgCyan: `${ESC}46;30m`,
  bgMagenta: `${ESC}45;37m`,
  bgBlue: `${ESC}44;37m`,
  bgGreen: `${ESC}42;30m`,
  bgYellow: `${ESC}43;30m`,
  bgRed: `${ESC}41;37m`,
  bgGray: `${ESC}100;37m`,
};

const c = colors;

function truncate(str: string, maxLen = 90): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}

export const logger = {
  /**
   * Main App Initialization Banner
   */
  banner(provider: string, fastModel: string, reasoningModel: string, maxDepth: number) {
    const width = 76;
    const line = '─'.repeat(width - 2);
    console.log(`\n${c.cyan}╭${line}╮${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.brightCyan}🚀 DEEP RESEARCH MULTI-AGENT SYSTEM${c.reset}${' '.repeat(width - 39)}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}├${line}┤${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Provider:${c.reset}   ${c.brightWhite}${provider}${c.reset}${' '.repeat(Math.max(1, width - 17 - provider.length))}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Fast Model:${c.reset} ${c.yellow}${fastModel}${c.reset}${' '.repeat(Math.max(1, width - 19 - fastModel.length))}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Reasoning:${c.reset}  ${c.magenta}${reasoningModel}${c.reset}${' '.repeat(Math.max(1, width - 19 - reasoningModel.length))}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Max Depth:${c.reset}  ${c.green}${maxDepth} recursive rounds${c.reset}${' '.repeat(Math.max(1, width - 33))}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}╰${line}╯${c.reset}\n`);
  },

  /**
   * User Research Query Box
   */
  researchGoal(query: string) {
    console.log(`${c.brightBlue}╭── 🔎 RESEARCH GOAL ───────────────────────────────────────────────────${c.reset}`);
    console.log(`${c.brightBlue}│${c.reset}  ${c.bold}"${query}"${c.reset}`);
    console.log(`${c.brightBlue}╰────────────────────────────────────────────────────────────────────────${c.reset}\n`);
  },

  /**
   * Gatekeeper Node Output
   */
  gatekeeper(decision: 'direct_answer' | 'research_required', reasoning: string) {
    const isDirect = decision === 'direct_answer';
    const badge = isDirect
      ? `${c.bgGreen} ⚡ DIRECT ANSWER ${c.reset}`
      : `${c.bgCyan} 🔬 DEEP RESEARCH REQUIRED ${c.reset}`;

    console.log(`${c.cyan}┌─── 🛡️  [Gatekeeper Agent] Triage & Routing${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Decision:${c.reset}   ${badge}`);
    console.log(`${c.cyan}│${c.reset}  ${c.gray}Reasoning:${c.reset}  ${c.dim}${truncate(reasoning, 120)}${c.reset}`);
    console.log(`${c.cyan}└───${c.reset}\n`);
  },

  /**
   * Planner Node Output
   */
  planner(strategy: string, subQueries: string[]) {
    console.log(`${c.magenta}┌─── 📋 [Planner Agent] Formulating Strategic Decomposition${c.reset}`);
    console.log(`${c.magenta}│${c.reset}  ${c.gray}Strategy:${c.reset}   ${c.dim}${truncate(strategy, 120)}${c.reset}`);
    console.log(`${c.magenta}│${c.reset}  ${c.gray}Generated Sub-Queries (${subQueries.length}):${c.reset}`);
    subQueries.forEach((sq, idx) => {
      const isLast = idx === subQueries.length - 1;
      const branch = isLast ? '└─' : '├─';
      console.log(`${c.magenta}│${c.reset}   ${c.gray}${branch}${c.reset} ${c.bold}${idx + 1}.${c.reset} ${c.brightWhite}"${sq}"${c.reset}`);
    });
    console.log(`${c.magenta}└───${c.reset}\n`);
  },

  /**
   * Researcher Round Header
   */
  researcherRoundStart(round: number, maxDepth: number, workerCount: number) {
    console.log(`${c.yellow}┌─── 🔍 [Researcher Node] Depth Round ${round} of ${maxDepth}${c.reset}`);
    console.log(`${c.yellow}│${c.reset}  ${c.gray}Spawning ${workerCount} concurrent search worker(s)...${c.reset}`);
  },

  /**
   * Single Worker Search Start
   */
  workerStart(index: number, query: string) {
    console.log(`${c.yellow}│${c.reset}   ${c.gray}├─ [Worker ${index}]${c.reset} ⚡ Searching: ${c.dim}"${truncate(query, 75)}"${c.reset}`);
  },

  /**
   * Single Worker Completion
   */
  workerSuccess(index: number, sourceCount: number) {
    console.log(`${c.yellow}│${c.reset}   ${c.gray}│  └─${c.reset} ${c.green}✓ Retrieved ${sourceCount} source(s)${c.reset}`);
  },

  /**
   * Single Worker Error
   */
  workerError(index: number, query: string, error: string) {
    console.log(`${c.yellow}│${c.reset}   ${c.gray}│  └─${c.reset} ${c.red}✗ Search failed: ${truncate(error, 60)}${c.reset}`);
  },

  /**
   * Researcher Round Complete
   */
  researcherRoundComplete(roundSources: number, totalAccumulated: number) {
    console.log(`${c.yellow}│${c.reset}  ${c.green}✓ Round Complete:${c.reset} ${c.bold}${roundSources} new finding(s)${c.reset} ${c.gray}(Total Pool: ${totalAccumulated} sources)${c.reset}`);
    console.log(`${c.yellow}└───${c.reset}\n`);
  },

  /**
   * Critic Evaluation
   */
  criticEvaluation(
    round: number,
    maxDepth: number,
    isSatisfied: boolean,
    critique: string,
    nextQueries: string[],
    purgedCount: number
  ) {
    const badge = isSatisfied
      ? `${c.bgGreen} ✅ SATISFIED — COMPLETE ${c.reset}`
      : `${c.bgYellow} 🔄 GAPS IDENTIFIED — RECURSION REQUIRED ${c.reset}`;

    console.log(`${c.brightMagenta}┌─── 🧐 [Critic Agent] Evaluation & Gap Analysis (Round ${round}/${maxDepth})${c.reset}`);
    console.log(`${c.brightMagenta}│${c.reset}  ${c.gray}Status:${c.reset}    ${badge}`);
    console.log(`${c.brightMagenta}│${c.reset}  ${c.gray}Critique:${c.reset}  ${c.dim}${truncate(critique, 120)}${c.reset}`);

    if (purgedCount > 0) {
      console.log(`${c.brightMagenta}│${c.reset}  ${c.red}🗑️ Garbage Purged:${c.reset} ${purgedCount} off-topic/noisy source(s) removed from context`);
    }

    if (!isSatisfied && nextQueries.length > 0) {
      console.log(`${c.brightMagenta}│${c.reset}  ${c.yellow}Follow-up Sub-Queries for Round ${round + 1} (${nextQueries.length}):${c.reset}`);
      nextQueries.forEach((q, i) => {
        const isLast = i === nextQueries.length - 1;
        const branch = isLast ? '└─' : '├─';
        console.log(`${c.brightMagenta}│${c.reset}   ${c.gray}${branch}${c.reset} ${c.bold}${i + 1}.${c.reset} ${c.brightWhite}"${q}"${c.reset}`);
      });
    }

    console.log(`${c.brightMagenta}└───${c.reset}\n`);
  },

  /**
   * Critic Max Depth Notice
   */
  criticMaxDepthReached(maxDepth: number, totalSources: number) {
    console.log(`${c.yellow}┌─── 🛑 [Critic Agent] Max Recursion Depth Budget Reached (${maxDepth}/${maxDepth})${c.reset}`);
    console.log(`${c.yellow}│${c.reset}  Proceeding directly to final report synthesis with ${c.bold}${totalSources} verified sources${c.reset}.`);
    console.log(`${c.yellow}└───${c.reset}\n`);
  },

  /**
   * Synthesizer Node Start & Stream Header
   */
  synthesizerStart(sourceCount: number, depth: number) {
    console.log(`${c.brightGreen}┌─── 📝 [Synthesizer Agent] Compiling Final Research Report${c.reset}`);
    console.log(`${c.brightGreen}│${c.reset}  Synthesizing insights from ${c.bold}${sourceCount} sources${c.reset} after ${c.bold}${depth} round(s)...`);
    console.log(`${c.brightGreen}│${c.reset}  Streaming publication-grade Markdown with clickable inline citations...`);
    console.log(`${c.brightGreen}└────────────────────────────────────────────────────────────────────────${c.reset}\n`);
  },

  /**
   * Report Saved Success Box
   */
  reportSaved(filename: string, fullPath: string) {
    console.log(`\n${c.green}╭── ✅ REPORT GENERATED & PERSISTED ────────────────────────────────────${c.reset}`);
    console.log(`${c.green}│${c.reset}  ${c.gray}Filename:${c.reset}  ${c.bold}${c.brightWhite}${filename}${c.reset}`);
    console.log(`${c.green}│${c.reset}  ${c.gray}Location:${c.reset}  ${c.dim}${fullPath}${c.reset}`);
    console.log(`${c.green}╰────────────────────────────────────────────────────────────────────────${c.reset}\n`);
  },

  /**
   * Workflow Summary Footer Box
   */
  workflowComplete(stats: {
    decision?: string;
    finalDepth?: number;
    maxDepth: number;
    totalSources?: number;
    isSatisfied?: boolean;
  }) {
    const width = 76;
    const line = '─'.repeat(width - 2);

    console.log(`${c.cyan}╭${line}╮${c.reset}`);
    console.log(`${c.cyan}│${c.reset}  ${c.bold}${c.brightCyan}🏁 RESEARCH WORKFLOW COMPLETED${c.reset}${' '.repeat(width - 34)}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}├${line}┤${c.reset}`);

    if (stats.decision) {
      console.log(`${c.cyan}│${c.reset}  ${c.gray}Route:${c.reset}         ${stats.decision === 'direct_answer' ? c.green + 'Direct Answer' : c.cyan + 'Deep Research'}${c.reset}${' '.repeat(Math.max(1, width - 29))}${c.cyan}│${c.reset}`);
    }

    if (stats.finalDepth !== undefined) {
      const depthStr = `${stats.finalDepth} / ${stats.maxDepth} rounds`;
      console.log(`${c.cyan}│${c.reset}  ${c.gray}Depth Reached:${c.reset} ${depthStr}${' '.repeat(Math.max(1, width - 22 - depthStr.length))}${c.cyan}│${c.reset}`);
    }

    if (stats.totalSources !== undefined && stats.totalSources > 0) {
      const srcStr = `${stats.totalSources} verified source(s)`;
      console.log(`${c.cyan}│${c.reset}  ${c.gray}Sources Used:${c.reset}  ${srcStr}${' '.repeat(Math.max(1, width - 21 - srcStr.length))}${c.cyan}│${c.reset}`);
    }

    console.log(`${c.cyan}╰${line}╯${c.reset}\n`);
  },

  /**
   * Generic Helpers
   */
  info(msg: string) {
    console.log(`${c.blue}ℹ${c.reset}  ${msg}`);
  },

  warn(msg: string) {
    console.log(`${c.yellow}⚠${c.reset}  ${c.yellow}${msg}${c.reset}`);
  },

  error(msg: string) {
    console.log(`${c.red}✖${c.reset}  ${c.red}${msg}${c.reset}`);
  },
};
