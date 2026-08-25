import { StateGraph, START, END } from '@langchain/langgraph';
import {
  ResearchStateAnnotation,
  type ResearchState,
} from '../state';
import { gatekeeperNode } from '../agents';

/**
 * Conditional edge router after Gatekeeper node execution.
 * Evaluates whether to short-circuit immediately with direct answer or proceed to research.
 */
export function routeGatekeeper(state: ResearchState): typeof END | 'planner_node' {
  if (state.gatekeeper?.decision === 'direct_answer') {
    return END;
  }

  // Will route to 'planner_node' once Planner agent is added
  return END;
}

/**
 * Creates and compiles the LangGraph StateGraph for the Research System.
 */
export function createResearchWorkflow() {
  const workflow = new StateGraph(ResearchStateAnnotation)
    .addNode('gatekeeper_node', gatekeeperNode)
    .addEdge(START, 'gatekeeper_node')
    .addConditionalEdges('gatekeeper_node', routeGatekeeper, {
      [END]: END,
    });

  return workflow.compile();
}

/**
 * Singleton instance of compiled research graph
 */
export const researchWorkflow = createResearchWorkflow();
