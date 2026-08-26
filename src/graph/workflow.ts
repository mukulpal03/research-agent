import { StateGraph, START, END } from '@langchain/langgraph';
import { env } from '../config';
import {
  ResearchStateAnnotation,
  type ResearchState,
} from '../state';
import {
  gatekeeperNode,
  plannerNode,
  researcherNode,
  criticNode,
  synthesizerNode,
} from '../agents';

/**
 * Conditional edge router after Gatekeeper node execution.
 * Evaluates whether to short-circuit immediately with direct answer or proceed to Planner.
 */
export function routeGatekeeper(state: ResearchState): typeof END | 'planner_node' {
  if (state.gatekeeper?.decision === 'direct_answer') {
    return END;
  }

  return 'planner_node';
}

/**
 * Conditional edge router after Critic node execution.
 * If satisfied (or max depth budget reached), routes to Synthesizer for final report compilation.
 * If critical gaps remain and depth budget allows, loops back to Researcher for follow-up pass.
 */
export function routeCritic(state: ResearchState): 'synthesizer_node' | 'researcher_node' {
  if (state.isSatisfied) {
    return 'synthesizer_node';
  }

  // Loop back to researcher for follow-up pass if depth allows
  if (state.depth && state.depth <= env.MAX_DEPTH) {
    return 'researcher_node';
  }

  // Budget reached -> Proceed to synthesis
  return 'synthesizer_node';
}

/**
 * Conditional edge router after Researcher node execution.
 * If 0 findings were gathered (e.g. Tavily search failed / limit exhausted), stops execution immediately.
 */
export function routeResearcher(state: ResearchState): typeof END | 'critic_node' {
  if (!state.researchData || state.researchData.length === 0) {
    return END;
  }
  return 'critic_node';
}

/**
 * Creates and compiles the complete LangGraph StateGraph for the Recursive Research System.
 */
export function createResearchWorkflow() {
  const workflow = new StateGraph(ResearchStateAnnotation)
    // 1. Agent Nodes
    .addNode('gatekeeper_node', gatekeeperNode)
    .addNode('planner_node', plannerNode)
    .addNode('researcher_node', researcherNode)
    .addNode('critic_node', criticNode)
    .addNode('synthesizer_node', synthesizerNode)

    // 2. Entry Edge: START -> gatekeeper_node
    .addEdge(START, 'gatekeeper_node')

    // 3. Conditional Routing after Gatekeeper (Direct Answer vs Deep Research)
    .addConditionalEdges('gatekeeper_node', routeGatekeeper, {
      [END]: END,
      planner_node: 'planner_node',
    })

    // 4. Edge: planner_node -> researcher_node
    .addEdge('planner_node', 'researcher_node')

    // 5. Conditional Routing after Researcher (Halt if 0 sources vs Proceed to Critic)
    .addConditionalEdges('researcher_node', routeResearcher, {
      [END]: END,
      critic_node: 'critic_node',
    })

    // 6. Conditional Recursive Routing after Critic (Loop back or Synthesize)
    .addConditionalEdges('critic_node', routeCritic, {
      synthesizer_node: 'synthesizer_node',
      researcher_node: 'researcher_node',
    })

    // 7. Terminal Edge: synthesizer_node -> END
    .addEdge('synthesizer_node', END);

  return workflow.compile();
}

/**
 * Singleton instance of compiled research graph
 */
export const researchWorkflow = createResearchWorkflow();
