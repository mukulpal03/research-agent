'use client';

import React from 'react';
import {
  ShieldCheck,
  ListTree,
  Search,
  Scale,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { ResearchStage, ResearchSession } from '@/lib/types';

interface AgentStepperProps {
  stage: ResearchStage;
  session: ResearchSession | null;
  statusMessage: string;
  subQueries: string[];
}

interface StepDef {
  id: ResearchStage;
  name: string;
  role: string;
  icon: React.ElementType;
}

const STEPS: StepDef[] = [
  {
    id: 'gatekeeper',
    name: 'Gatekeeper',
    role: 'Triage & Scope Evaluation',
    icon: ShieldCheck,
  },
  {
    id: 'planner',
    name: 'Planner',
    role: 'Decomposition into Sub-Queries',
    icon: ListTree,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Concurrent Web Retrieval',
    icon: Search,
  },
  {
    id: 'critic',
    name: 'Critic',
    role: 'Garbage Collection & Depth Evaluation',
    icon: Scale,
  },
  {
    id: 'synthesizer',
    name: 'Synthesizer',
    role: 'Report Compilation & Citations',
    icon: FileText,
  },
];

export function AgentStepper({
  stage,
  session,
  statusMessage,
  subQueries,
}: AgentStepperProps) {
  const getStepStatus = (stepId: ResearchStage) => {
    if (stage === 'failed') return 'failed';
    if (stage === 'completed') return 'completed';

    const order: ResearchStage[] = [
      'gatekeeper',
      'planner',
      'researcher',
      'critic',
      'synthesizer',
    ];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E9E6E6]">
        <div>
          <h2 className="font-editorial text-2xl text-[#2E2E2E] font-normal">
            Autonomous Pipeline Execution
          </h2>
          <p className="text-sm text-[#57564C] mt-1">
            {statusMessage || 'Agents actively coordinating...'}
          </p>
        </div>

        {session && (
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#F5F5F5] text-[#57564C] font-mono font-medium">
              Depth: {session.depth} / {session.maxDepth}
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#FAF8F5] text-[#024F46] border border-[#E9E6E6] font-medium">
              {session.sources.length} Sources Found
            </span>
          </div>
        )}
      </div>

      {/* Stepper Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
        {STEPS.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                status === 'active'
                  ? 'bg-[#FAF8F5] border-2 border-[#024F46] shadow-sm'
                  : status === 'completed'
                  ? 'bg-[#F5F5F5] border border-transparent'
                  : 'bg-[#FAF8F5]/50 border border-[#E9E6E6] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    status === 'active'
                      ? 'bg-[#024F46] text-[#ECBA82]'
                      : status === 'completed'
                      ? 'bg-[#024F46]/10 text-[#024F46]'
                      : 'bg-[#E9E6E6] text-[#82817A]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  {status === 'active' && (
                    <Loader2 className="w-4 h-4 text-[#024F46] animate-spin" />
                  )}
                  {status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-[#024F46]" />
                  )}
                  {status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-editorial text-lg text-[#2E2E2E] leading-tight">
                  {step.name}
                </h3>
                <p className="text-xs text-[#82817A] mt-1 leading-snug">
                  {step.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Sub-Queries Decomposition Pills */}
      {subQueries && subQueries.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#E9E6E6]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#82817A] mb-3">
            Active Sub-Questions Being Researched
          </h4>
          <div className="flex flex-wrap gap-2">
            {subQueries.map((sq, idx) => (
              <div
                key={idx}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-[#F5F5F5] text-[#57564C] border border-[#E9E6E6] flex items-center gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-[#ECBA82] text-[#024F46] text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{sq}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critic Multi-Round History (if applicable) */}
      {session?.criticHistory && session.criticHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E9E6E6] flex flex-col gap-2">
          {session.criticHistory.map((c, i) => (
            <div
              key={i}
              className="text-xs p-3 rounded-xl bg-[#FAF8F5] text-[#57564C] border border-[#E9E6E6] flex items-start justify-between gap-4"
            >
              <div>
                <span className="font-semibold text-[#2E2E2E]">
                  Critic Round {c.depth} Evaluation:
                </span>{' '}
                <span className="italic">{c.critique || 'Evaluated research data.'}</span>
              </div>
              {c.purgedSourceCount ? (
                <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                  {c.purgedSourceCount} irrelevant sources purged (GC)
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
