import { StateGraph, START, END } from '@langchain/langgraph';
import {
  ResearchStateAnnotation,
  type ResearchState,
} from '../state';
import { gatekeeperNode, plannerNode, researcherNode } from '../agents';

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
 * Creates and compiles the LangGraph StateGraph for the Research System.
 */
export function createResearchWorkflow() {
  const workflow = new StateGraph(ResearchStateAnnotation)
    // Agent Nodes
    .addNode('gatekeeper_node', gatekeeperNode)
    .addNode('planner_node', plannerNode)
    .addNode('researcher_node', researcherNode)

    // Entry Edge: START -> gatekeeper_node
    .addEdge(START, 'gatekeeper_node')

    // Conditional Routing after Gatekeeper
    .addConditionalEdges('gatekeeper_node', routeGatekeeper, {
      [END]: END,
      planner_node: 'planner_node',
    })
    .addEdge('planner_node', 'researcher_node')
    .addEdge('researcher_node', END);

  return workflow.compile();
}

/**
 * Singleton instance of compiled research graph
 */
export const researchWorkflow = createResearchWorkflow();
