import { researchWorkflow } from '@/src/graph';
import { memoryStore } from '@/lib/memoryStore';
import { eventDispatcher } from '@/lib/events';
import { logger } from '@/src/utils';
import type { GatekeeperOutput, CriticOutput, ResearchFinding } from '@/src/state';

export class ResearchService {
  public async executeSession(sessionId: string): Promise<void> {
    const session = memoryStore.getSession(sessionId);
    if (!session) {
      logger.error(`Cannot execute non-existent session ${sessionId}`);
      return;
    }

    try {
      memoryStore.setStage(sessionId, 'gatekeeper', 'running');
      eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
        stage: 'gatekeeper',
        message: 'Gatekeeper evaluating query complexity...',
      });

      const stream = await researchWorkflow.stream(
        { originalQuery: session.query, sessionId: session.id },
        { streamMode: 'updates' }
      );

      let lastSeenSourceCount = 0;

      for await (const chunk of stream) {
        for (const [nodeName, update] of Object.entries(chunk)) {
          await this.handleNodeUpdate(
            sessionId,
            nodeName,
            update,
            () => lastSeenSourceCount,
            (newCount) => {
              lastSeenSourceCount = newCount;
            }
          );
        }
      }

      const finalSession = memoryStore.getSession(sessionId);
      if (finalSession && finalSession.status !== 'completed' && finalSession.status !== 'failed') {
        const report = finalSession.finalReport || '';
        memoryStore.completeSession(sessionId, report);
        eventDispatcher.emitEvent(sessionId, 'RESEARCH_COMPLETE', {
          session: memoryStore.getSession(sessionId),
        });
      }

      eventDispatcher.closeSessionStreams(sessionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Workflow execution failed for session ${sessionId}: ${errorMessage}`);

      memoryStore.failSession(sessionId, errorMessage);
      eventDispatcher.emitEvent(sessionId, 'RESEARCH_ERROR', {
        error: errorMessage,
      });

      // Small delay to ensure event is fully transmitted across SSE stream before closing
      await new Promise((resolve) => setTimeout(resolve, 500));
      eventDispatcher.closeSessionStreams(sessionId);
    }
  }

  private async handleNodeUpdate(
    sessionId: string,
    nodeName: string,
    update: any,
    getLastSourceCount: () => number,
    setLastSourceCount: (c: number) => void
  ): Promise<void> {
    const currentSession = memoryStore.getSession(sessionId);
    if (!currentSession) return;

    switch (nodeName) {
      case 'gatekeeper_node': {
        const gatekeeper = update.gatekeeper as GatekeeperOutput | undefined;
        if (gatekeeper) {
          memoryStore.updateSession(sessionId, {
            gatekeeper,
            ...(update.finalReport ? { finalReport: update.finalReport } : {}),
          });

          eventDispatcher.emitEvent(sessionId, 'GATEKEEPER_DONE', {
            decision: gatekeeper.decision,
            reasoning: gatekeeper.reasoning,
            directResponse: gatekeeper.directResponse,
          });

          if (gatekeeper.decision === 'direct_answer') {
            memoryStore.completeSession(sessionId, update.finalReport || gatekeeper.directResponse || '');
            eventDispatcher.emitEvent(sessionId, 'RESEARCH_COMPLETE', {
              session: memoryStore.getSession(sessionId),
            });
          } else {
            memoryStore.setStage(sessionId, 'planner');
            eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
              stage: 'planner',
              message: 'Planner breaking down query into sub-questions...',
            });
          }
        }
        break;
      }

      case 'planner_node': {
        const subQueries = (update.subQueries as string[]) || [];
        const depth = update.depth || 1;

        memoryStore.updateSession(sessionId, {
          subQueries,
          depth,
        });

        eventDispatcher.emitEvent(sessionId, 'PLANNER_DONE', {
          subQueries,
          depth,
        });

        memoryStore.setStage(sessionId, 'researcher');
        eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
          stage: 'researcher',
          message: `Researcher launching concurrent web searches for ${subQueries.length} sub-queries...`,
        });
        break;
      }

      case 'researcher_node': {
        const researchData = (update.researchData as ResearchFinding[]) || [];
        const lastCount = getLastSourceCount();
        const newFindings = researchData.slice(lastCount);
        setLastSourceCount(researchData.length);

        if (researchData.length === 0) {
          const errorMsg = 'Oops! Looks like the Tavily free limit is exhausted. Please contact Mukul :)';
          memoryStore.failSession(sessionId, errorMsg);
          eventDispatcher.emitEvent(sessionId, 'RESEARCH_ERROR', {
            error: errorMsg,
          });
          return;
        }

        memoryStore.addSources(sessionId, newFindings);

        eventDispatcher.emitEvent(sessionId, 'RESEARCHER_SOURCES', {
          newSourcesCount: newFindings.length,
          totalSourcesCount: researchData.length,
          sources: newFindings,
        });

        memoryStore.setStage(sessionId, 'critic');
        eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
          stage: 'critic',
          message: 'Critic evaluating research completeness and running garbage collection...',
        });
        break;
      }

      case 'critic_node': {
        const critic = update.critic as CriticOutput | undefined;
        const isSatisfied = Boolean(update.isSatisfied);
        const depth = update.depth ?? currentSession.depth;
        const subQueries = (update.subQueries as string[]) || [];
        const updatedResearchData = (update.researchData as ResearchFinding[]) || currentSession.sources;

        if (critic) {
          const purgedCount = currentSession.sources.length - updatedResearchData.length;
          memoryStore.addCriticRound(sessionId, {
            depth,
            maxDepth: currentSession.maxDepth,
            isSatisfied,
            critique: critic.critique,
            nextSubQueries: critic.nextSubQueries,
            purgedSourceCount: purgedCount > 0 ? purgedCount : 0,
            timestamp: new Date().toISOString(),
          });

          if (purgedCount > 0) {
            memoryStore.updateSession(sessionId, { sources: updatedResearchData });
          }

          eventDispatcher.emitEvent(sessionId, 'CRITIC_EVALUATED', {
            isSatisfied,
            depth,
            maxDepth: currentSession.maxDepth,
            critique: critic.critique,
            nextSubQueries: subQueries,
            purgedSourceCount: purgedCount > 0 ? purgedCount : 0,
          });

          if (!isSatisfied && subQueries.length > 0) {
            memoryStore.setStage(sessionId, 'researcher');
            eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
              stage: 'researcher',
              message: `Critic requested follow-up research (Depth ${depth}/${currentSession.maxDepth}). Searching ${subQueries.length} new sub-queries...`,
            });
          } else {
            memoryStore.setStage(sessionId, 'synthesizer');
            eventDispatcher.emitEvent(sessionId, 'STAGE_CHANGED', {
              stage: 'synthesizer',
              message: 'Synthesizer compiling exhaustive research report with inline citations...',
            });
          }
        }
        break;
      }

      case 'synthesizer_node': {
        const finalReport = update.finalReport as string | undefined;
        if (finalReport) {
          memoryStore.completeSession(sessionId, finalReport);
          eventDispatcher.emitEvent(sessionId, 'RESEARCH_COMPLETE', {
            session: memoryStore.getSession(sessionId),
          });
        }
        break;
      }
    }
  }
}

const globalForService = globalThis as unknown as { researchService: ResearchService };
export const researchService = globalForService.researchService || new ResearchService();
if (process.env.NODE_ENV !== 'production') globalForService.researchService = researchService;
