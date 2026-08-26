/**
 * Sleek Terminal Styling & Logger Utility for Deep Research Agent
 */
import boxen from 'boxen';

const ESC = '\x1b[';

function hex(hexStr: string): string {
  const hex = hexStr.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
}

function bgHex(hexStr: string): string {
  const hex = hexStr.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `\x1b[48;2;${r};${g};${b}m`;
}

// Catppuccin Mocha Palette
const catppuccin = {
  rosewater: '#f5e0dc',
  flamingo: '#f2cdcd',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  red: '#f38ba8',
  maroon: '#eba0ac',
  peach: '#fab387',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  teal: '#94e2d5',
  sky: '#89dceb',
  sapphire: '#74c7ec',
  blue: '#89b4fa',
  lavender: '#b4befe',
  text: '#cdd6f4',
  overlay1: '#7f849c',
  overlay0: '#6c7086',
  base: '#1e1e2e',
};

export const colors = {
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: hex(catppuccin.overlay1),
  italic: `${ESC}3m`,
  underline: `${ESC}4m`,

  // Colors
  black: hex(catppuccin.base),
  red: hex(catppuccin.red),
  green: hex(catppuccin.green),
  yellow: hex(catppuccin.yellow),
  blue: hex(catppuccin.blue),
  magenta: hex(catppuccin.mauve),
  cyan: hex(catppuccin.sky),
  white: hex(catppuccin.text),
  gray: hex(catppuccin.overlay0),

  // Bright
  brightRed: hex(catppuccin.maroon),
  brightGreen: hex(catppuccin.teal),
  brightYellow: hex(catppuccin.peach),
  brightBlue: hex(catppuccin.sapphire),
  brightMagenta: hex(catppuccin.pink),
  brightCyan: hex(catppuccin.sky),
  brightWhite: hex(catppuccin.rosewater),

  // Background Badges
  bgCyan: `${bgHex(catppuccin.sky)}${hex(catppuccin.base)}${ESC}1m`,
  bgMagenta: `${bgHex(catppuccin.mauve)}${hex(catppuccin.base)}${ESC}1m`,
  bgBlue: `${bgHex(catppuccin.blue)}${hex(catppuccin.base)}${ESC}1m`,
  bgGreen: `${bgHex(catppuccin.green)}${hex(catppuccin.base)}${ESC}1m`,
  bgYellow: `${bgHex(catppuccin.yellow)}${hex(catppuccin.base)}${ESC}1m`,
  bgRed: `${bgHex(catppuccin.red)}${hex(catppuccin.base)}${ESC}1m`,
  bgGray: `${bgHex(catppuccin.overlay0)}${hex(catppuccin.text)}${ESC}1m`,
};

const c = colors;

function truncate(str: string, maxLen = 90): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}

let isSilent = false;
export function setSilentMode(val: boolean) {
  isSilent = val;
}

function shouldLog(): boolean {
  if (isSilent) return false;
  if (process.env.NEXT_RUNTIME) return false;
  return true;
}

export const logger = {
  /**
   * Main App Initialization Banner
   */
  banner(provider: string, fastModel: string, reasoningModel: string, maxDepth: number) {
    if (!shouldLog()) return;
    const content = `${c.gray}Provider:${c.reset}   ${c.brightWhite}${provider}${c.reset}
${c.gray}Fast Model:${c.reset} ${c.yellow}${fastModel}${c.reset}
${c.gray}Reasoning:${c.reset}  ${c.magenta}${reasoningModel}${c.reset}
${c.gray}Max Depth:${c.reset}  ${c.green}${maxDepth} recursive rounds${c.reset}`;

    console.log('\n' + boxen(content, { 
      title: `${c.bold}${c.brightCyan}🚀 DEEP RESEARCH MULTI-AGENT SYSTEM${c.reset}`,
      padding: 1, 
      borderColor: 'cyan', 
      borderStyle: 'round' 
    }) + '\n');
  },

  /**
   * User Research Query Box
   */
  researchGoal(query: string) {
    if (!shouldLog()) return;
    console.log('\n' + boxen(`${c.bold}"${query}"${c.reset}`, {
      title: `${c.brightBlue}🔎 RESEARCH GOAL${c.reset}`,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'blue',
      borderStyle: 'round'
    }) + '\n');
  },

  /**
   * Gatekeeper Node Output
   */
  gatekeeper(decision: 'direct_answer' | 'research_required', reasoning: string) {
    if (!shouldLog()) return;
    const isDirect = decision === 'direct_answer';
    const badge = isDirect
      ? `${c.bgGreen} ⚡ DIRECT ANSWER ${c.reset}`
      : `${c.bgCyan} 🔬 DEEP RESEARCH REQUIRED ${c.reset}`;

    const content = `${c.gray}Decision:${c.reset}   ${badge}\n${c.gray}Reasoning:${c.reset}  ${c.dim}${reasoning}${c.reset}`;
    console.log(boxen(content, {
      title: `${c.cyan}🛡️ [Gatekeeper Agent] Triage & Routing${c.reset}`,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'cyan',
      borderStyle: 'round'
    }) + '\n');
  },

  /**
   * Planner Node Output
   */
  planner(strategy: string, subQueries: string[]) {
    if (!shouldLog()) return;
    let content = `${c.gray}Strategy:${c.reset}   ${c.dim}${strategy}${c.reset}\n`;
    content += `${c.gray}Generated Sub-Queries (${subQueries.length}):${c.reset}\n`;
    subQueries.forEach((sq, idx) => {
      content += `  ${c.bold}${idx + 1}.${c.reset} ${c.brightWhite}"${sq}"${c.reset}\n`;
    });

    console.log(boxen(content.trimEnd(), {
      title: `${c.magenta}📋 [Planner Agent] Formulating Strategic Decomposition${c.reset}`,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'magenta',
      borderStyle: 'round'
    }) + '\n');
  },

  /**
   * Researcher Round Header
   */
  researcherRoundStart(round: number, maxDepth: number, workerCount: number) {
    if (!shouldLog()) return;
    console.log(`${c.yellow}┌─── 🔍 [Researcher Node] Depth Round ${round} of ${maxDepth}${c.reset}`);
    console.log(`${c.yellow}│${c.reset}  ${c.gray}Spawning ${workerCount} concurrent search worker(s)...${c.reset}`);
  },

  /**
   * Single Worker Search Start
   */
  workerStart(index: number, query: string) {
    if (!shouldLog()) return;
    console.log(`${c.yellow}│${c.reset}   ${c.gray}├─ [Worker ${index}]${c.reset} ⚡ Searching: ${c.dim}"${truncate(query, 75)}"${c.reset}`);
  },

  /**
   * Single Worker Completion
   */
  workerSuccess(index: number, sourceCount: number) {
    if (!shouldLog()) return;
    console.log(`${c.yellow}│${c.reset}   ${c.gray}│  └─${c.reset} ${c.green}✓ Retrieved ${sourceCount} source(s)${c.reset}`);
  },

  /**
   * Single Worker Error
   */
  workerError(index: number, query: string, error: string) {
    if (!shouldLog()) return;
    console.log(`${c.yellow}│${c.reset}   ${c.gray}│  └─${c.reset} ${c.red}✗ Search failed: ${truncate(error, 60)}${c.reset}`);
  },

  /**
   * Researcher Round Complete
   */
  researcherRoundComplete(roundSources: number, totalAccumulated: number) {
    if (!shouldLog()) return;
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
    if (!shouldLog()) return;
    const badge = isSatisfied
      ? `${c.bgGreen} ✅ SATISFIED — COMPLETE ${c.reset}`
      : `${c.bgYellow} 🔄 GAPS IDENTIFIED — RECURSION REQUIRED ${c.reset}`;

    let content = `${c.gray}Status:${c.reset}    ${badge}\n`;
    content += `${c.gray}Critique:${c.reset}  ${c.dim}${critique}${c.reset}\n`;

    if (purgedCount > 0) {
      content += `${c.red}🗑️ Garbage Purged:${c.reset} ${purgedCount} off-topic/noisy source(s) removed from context\n`;
    }

    if (!isSatisfied && nextQueries.length > 0) {
      content += `${c.yellow}Follow-up Sub-Queries for Round ${round + 1} (${nextQueries.length}):${c.reset}\n`;
      nextQueries.forEach((q, i) => {
        content += `  ${c.bold}${i + 1}.${c.reset} ${c.brightWhite}"${q}"${c.reset}\n`;
      });
    }

    console.log(boxen(content.trimEnd(), {
      title: `${c.brightMagenta}🧐 [Critic Agent] Evaluation & Gap Analysis (Round ${round}/${maxDepth})${c.reset}`,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'magenta',
      borderStyle: 'round'
    }) + '\n');
  },

  /**
   * Critic Max Depth Notice
   */
  criticMaxDepthReached(maxDepth: number, totalSources: number) {
    if (!shouldLog()) return;
    const content = `Proceeding directly to final report synthesis with ${c.bold}${totalSources} verified sources${c.reset}.`;
    console.log(boxen(content, {
      title: `${c.yellow}🛑 [Critic Agent] Max Recursion Depth Budget Reached (${maxDepth}/${maxDepth})${c.reset}`,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'yellow',
      borderStyle: 'round'
    }) + '\n');
  },

  /**
   * Synthesizer Node Start & Stream Header
   */
  synthesizerStart(sourceCount: number, depth: number) {
    if (!shouldLog()) return;
    console.log(`${c.brightGreen}┌─── 📝 [Synthesizer Agent] Compiling Final Research Report${c.reset}`);
    console.log(`${c.brightGreen}│${c.reset}  Synthesizing insights from ${c.bold}${sourceCount} sources${c.reset} after ${c.bold}${depth} round(s)...`);
    console.log(`${c.brightGreen}│${c.reset}  Streaming publication-grade Markdown with clickable inline citations...`);
    console.log(`${c.brightGreen}└────────────────────────────────────────────────────────────────────────${c.reset}\n`);
  },

  /**
   * Report Saved Success Box
   */
  reportSaved(filename: string, fullPath: string) {
    if (!shouldLog()) return;
    const content = `${c.gray}Filename:${c.reset}  ${c.bold}${c.brightWhite}${filename}${c.reset}\n${c.gray}Location:${c.reset}  ${c.dim}${fullPath}${c.reset}`;
    console.log('\n' + boxen(content, {
      title: `${c.green}✅ REPORT GENERATED & PERSISTED${c.reset}`,
      padding: 1,
      borderColor: 'green',
      borderStyle: 'round'
    }) + '\n');
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
    if (!shouldLog()) return;
    let content = '';
    
    if (stats.decision) {
      content += `${c.gray}Route:${c.reset}         ${stats.decision === 'direct_answer' ? c.green + 'Direct Answer' : c.cyan + 'Deep Research'}${c.reset}\n`;
    }
    if (stats.finalDepth !== undefined) {
      content += `${c.gray}Depth Reached:${c.reset} ${stats.finalDepth} / ${stats.maxDepth} rounds\n`;
    }
    if (stats.totalSources !== undefined && stats.totalSources > 0) {
      content += `${c.gray}Sources Used:${c.reset}  ${stats.totalSources} verified source(s)\n`;
    }

    console.log('\n' + boxen(content.trim(), { 
      title: `${c.bold}${c.brightCyan}🏁 RESEARCH WORKFLOW COMPLETED${c.reset}`,
      padding: 1, 
      borderColor: 'cyan', 
      borderStyle: 'round' 
    }) + '\n');
  },

  /**
   * Generic Helpers
   */
  info(msg: string) {
    if (!shouldLog()) return;
    console.log(`${c.blue}ℹ${c.reset}  ${msg}`);
  },

  warn(msg: string) {
    if (!shouldLog()) return;
    console.log(`${c.yellow}⚠${c.reset}  ${c.yellow}${msg}${c.reset}`);
  },

  error(msg: string) {
    if (!shouldLog()) return;
    console.log(`${c.red}✖${c.reset}  ${c.red}${msg}${c.reset}`);
  },
};
