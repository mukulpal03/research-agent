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
 * If satisfied, finishes research. If gaps remain and depth <= MAX_DEPTH, loops back to Researcher.
 */
export function routeCritic(state: ResearchState): typeof END | 'researcher_node' {
  if (state.isSatisfied) {
    return END;
  }

  // Loop back to researcher for follow-up pass if depth allows
  if (state.depth && state.depth <= env.MAX_DEPTH) {
    return 'researcher_node';
  }

  return END;
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
    .addNode('critic_node', criticNode)

    // Entry Edge: START -> gatekeeper_node
    .addEdge(START, 'gatekeeper_node')

    // Conditional Routing after Gatekeeper
    .addConditionalEdges('gatekeeper_node', routeGatekeeper, {
      [END]: END,
      planner_node: 'planner_node',
    })

    // Edge: planner_node -> researcher_node
    .addEdge('planner_node', 'researcher_node')

    // Edge: researcher_node -> critic_node
    .addEdge('researcher_node', 'critic_node')

    // Conditional Recursive Routing after Critic (Loop back or finish)
    .addConditionalEdges('critic_node', routeCritic, {
      [END]: END,
      researcher_node: 'researcher_node',
    });

  return workflow.compile();
}

/**
 * Singleton instance of compiled research graph
 */
export const researchWorkflow = createResearchWorkflow();
