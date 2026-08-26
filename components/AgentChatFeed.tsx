'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ShieldCheck,
  ListTree,
  Search,
  Scale,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Globe,
  Copy,
  Download,
  Check,
  Clock,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import type {
  ResearchSession,
  ResearchStage,
  WorkerStatusPayload,
  CriticRoundRecord,
} from '../lib/types';
import type { ResearchFinding } from '../src/state';

interface AgentChatFeedProps {
  session: ResearchSession | null;
  stage: ResearchStage;
  isStreaming: boolean;
  subQueries: string[];
  sources: ResearchFinding[];
  reportMarkdown: string;
  workers: WorkerStatusPayload[];
}

export function AgentChatFeed({
  session,
  stage,
  isStreaming,
  subQueries,
  sources,
  reportMarkdown,
  workers,
}: AgentChatFeedProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabledRef = useRef(true);

  // ChatGPT-style auto-scroll to bottom while streaming
  useEffect(() => {
    if (autoScrollEnabledRef.current && reportContainerRef.current) {
      reportContainerRef.current.scrollTop = reportContainerRef.current.scrollHeight;
    }
  }, [reportMarkdown]);

  const handleReportScroll = () => {
    if (!reportContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = reportContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    autoScrollEnabledRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (reportContainerRef.current) {
      reportContainerRef.current.scrollTo({
        top: reportContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      autoScrollEnabledRef.current = true;
      setShowScrollBottom(false);
    }
  };

  if (!session) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `research-report-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isDirectAnswer = session.gatekeeper?.decision === 'direct_answer';
  const hasStarted = session.status === 'running' || session.status === 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. User Research Goal Box */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border-2 border-[#024F46]/20 shadow-sm">
        <div className="flex items-center gap-2.5 text-[#024F46] font-mono text-xs font-bold uppercase tracking-wider mb-2">
          <Search className="w-4 h-4 text-[#024F46]" />
          <span>🔎 Research Goal</span>
          <span className="ml-auto text-[11px] font-sans font-normal text-[#82817A]">
            Depth: {session.maxDepth} rounds
          </span>
        </div>
        <p className="font-editorial text-xl sm:text-2xl text-[#2E2E2E] font-medium leading-snug">
          "{session.query}"
        </p>
      </div>

      {/* 2. Gatekeeper Agent Card */}
      {(session.gatekeeper || stage === 'gatekeeper' || stage !== 'idle') && (
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E9E6E6] shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E9E6E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#024F46] text-[#ECBA82] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-[#024F46] uppercase tracking-wide">
                🛡️ [Gatekeeper Agent] Triage & Routing
              </span>
            </div>

            {stage === 'gatekeeper' && isStreaming && (
              <span className="flex items-center gap-1.5 text-xs text-[#024F46] font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Evaluating query...
              </span>
            )}
          </div>

          {session.gatekeeper ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#82817A]">Decision:</span>
                {session.gatekeeper.decision === 'direct_answer' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    ⚡ DIRECT ANSWER
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#024F46]/10 text-[#024F46] text-xs font-bold font-mono">
                    🔬 DEEP RESEARCH REQUIRED
                  </span>
                )}
              </div>

              {session.gatekeeper.reasoning && (
                <div className="text-xs text-[#57564C] bg-[#FAF8F5] p-3 rounded-xl border border-[#E9E6E6] leading-relaxed">
                  <span className="font-semibold text-[#2E2E2E]">Reasoning: </span>
                  {session.gatekeeper.reasoning}
                </div>
              )}

              {isDirectAnswer && session.gatekeeper.directResponse && (
                <div className="mt-4 p-4 rounded-xl bg-[#FAF8F5] border-2 border-[#024F46]/20">
                  <h4 className="font-editorial text-lg text-[#2E2E2E] mb-2 font-medium">
                    Immediate Direct Answer:
                  </h4>
                  <p className="text-sm text-[#2E2E2E] leading-relaxed font-sans">
                    {session.gatekeeper.directResponse}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 flex items-center gap-2 text-xs text-[#82817A] italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#024F46]" />
              Analyzing scope and deciding if web retrieval is required...
            </div>
          )}
        </div>
      )}

      {/* 3. Planner Agent Card (Only if deep research) */}
      {!isDirectAnswer && (session.subQueries?.length > 0 || subQueries.length > 0 || stage === 'planner') && (
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E9E6E6] shadow-sm transition-all">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E9E6E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#6b21a8] text-white flex items-center justify-center">
                <ListTree className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-[#6b21a8] uppercase tracking-wide">
                📋 [Planner Agent] Formulating Strategic Decomposition
              </span>
            </div>

            {stage === 'planner' && isStreaming && (
              <span className="flex items-center gap-1.5 text-xs text-[#6b21a8] font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Decomposing sub-queries...
              </span>
            )}
          </div>

          {(subQueries.length > 0 || session.subQueries?.length > 0) ? (
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#82817A]">
                Generated Sub-Queries ({(subQueries.length || session.subQueries?.length || 0)}):
              </p>
              <div className="space-y-2">
                {(subQueries.length > 0 ? subQueries : session.subQueries).map((sq, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E9E6E6] text-xs text-[#2E2E2E]"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#6b21a8] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium pt-0.5 leading-relaxed font-sans">
                      "{sq}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-2 flex items-center gap-2 text-xs text-[#82817A] italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6b21a8]" />
              Formulating optimal multi-round search queries...
            </div>
          )}
        </div>
      )}

      {/* 4. Researcher Workers Card (Live Terminal Tree View) */}
      {!isDirectAnswer && (workers.length > 0 || sources.length > 0 || stage === 'researcher') && (
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E9E6E6] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E9E6E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-amber-800 uppercase tracking-wide">
                🔍 [Researcher Node] Depth Round {session.depth || 1} of {session.maxDepth}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#024F46]">
                {sources.length} sources accumulated
              </span>
            </div>
          </div>

          {/* Workers Tree */}
          <div className="bg-[#1A1A1A] rounded-xl p-4 font-mono text-xs text-white/90 space-y-2 overflow-hidden">
            <div className="text-[#ECBA82] text-[11px] font-bold flex items-center gap-1.5 pb-1">
              <span>┌─── Concurrently Crawling Web Intelligence</span>
            </div>

            {workers.length > 0 ? (
              workers.map((w, idx) => (
                <div key={idx} className="flex flex-col space-y-1 pl-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-white/40">├─ [Worker {w.workerIndex}]</span>
                    {w.status === 'searching' && (
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                        <span>Searching: "{w.query}"</span>
                      </span>
                    )}
                    {w.status === 'completed' && (
                      <span className="text-white/90">
                        "{w.query}"
                      </span>
                    )}
                    {w.status === 'failed' && (
                      <span className="text-red-400">
                        ✗ Failed: "{w.query}"
                      </span>
                    )}
                  </div>

                  {w.status === 'completed' && (
                    <div className="pl-6 text-emerald-400 flex items-center gap-1">
                      <span>│  └─</span>
                      <Check className="w-3 h-3" />
                      <span>Retrieved {w.sourcesCount ?? 0} verified source(s)</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="pl-4 text-white/50 italic py-1 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-[#ECBA82]" />
                Spawning search workers...
              </div>
            )}

            <div className="text-emerald-400 text-[11px] font-bold pt-2 border-t border-white/10 flex items-center justify-between">
              <span>└─── Pool Total: {sources.length} Verified Sources</span>
              {sources.length > 0 && (
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="text-xs text-[#ECBA82] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>{showSources ? 'Hide Sources Grid' : 'View Discovered Sources'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Sources Drawer */}
          {showSources && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E9E6E6] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E9E6E6] hover:border-[#024F46] flex items-center justify-between gap-2 text-xs group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#2E2E2E] truncate">
                      {s.title || 'Source'}
                    </p>
                    <p className="text-[10px] font-mono text-[#82817A] truncate">
                      {s.url}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#82817A] group-hover:text-[#024F46] shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Critic Agent Card */}
      {!isDirectAnswer && (session.criticHistory?.length > 0 || stage === 'critic') && (
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E9E6E6] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E9E6E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-700 text-white flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-pink-800 uppercase tracking-wide">
                🧐 [Critic Agent] Evaluation & Gap Analysis
              </span>
            </div>

            {stage === 'critic' && isStreaming && (
              <span className="flex items-center gap-1.5 text-xs text-pink-700 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Evaluating completeness...
              </span>
            )}
          </div>

          {session.criticHistory?.length > 0 ? (
            <div className="space-y-3">
              {session.criticHistory.map((ch, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E9E6E6] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-[#57564C]">
                      Round {ch.depth} / {ch.maxDepth}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        ch.isSatisfied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ch.isSatisfied ? '✅ SATISFIED — COMPLETE' : '🔄 GAPS IDENTIFIED — RECURSION'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-[#2E2E2E] block mb-1.5 text-xs font-mono uppercase tracking-wide">
                      Assessment & Gap Breakdown:
                    </span>
                    <div className="prose prose-sm max-w-none text-[#57564C] text-xs leading-relaxed prose-p:my-1 prose-strong:text-[#2E2E2E] prose-strong:font-semibold prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {ch.critique}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {(ch.purgedSourceCount ?? 0) > 0 && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50/80 p-2.5 rounded-xl border border-red-200/60 font-mono text-[11px]">
                      <Trash2 className="w-4 h-4 shrink-0 text-red-600" />
                      <span>
                        <strong className="font-semibold">Garbage Purged:</strong> {ch.purgedSourceCount} irrelevant source(s) identified and removed from context.
                      </span>
                    </div>
                  )}

                  {!ch.isSatisfied && ch.nextSubQueries && ch.nextSubQueries.length > 0 && (
                    <div className="pt-2.5 border-t border-[#E9E6E6] space-y-1.5">
                      <span className="font-semibold text-amber-900 text-xs font-mono uppercase tracking-wide">
                        Follow-up sub-queries for next round ({ch.nextSubQueries.length}):
                      </span>
                      <div className="space-y-1.5 pt-1">
                        {ch.nextSubQueries.map((nq, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E9E6E6] text-xs text-[#2E2E2E]"
                          >
                            <span className="w-4 h-4 rounded bg-amber-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="font-medium">"{nq}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 flex items-center gap-2 text-xs text-[#82817A] italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-700" />
              Critique agent reviewing gathered sources for quality and coverage...
            </div>
          )}
        </div>
      )}

      {/* 6. Synthesizer Agent Report Card (Live Token Stream) */}
      {!isDirectAnswer && (reportMarkdown || stage === 'synthesizer' || stage === 'completed') && (
        <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border-2 border-[#024F46]/30 shadow-lg space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E6E6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#024F46] text-[#ECBA82] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-[#024F46] uppercase tracking-wide">
                  📝 [Synthesizer Agent] Final Research Report
                </span>
                <h3 className="font-editorial text-2xl text-[#2E2E2E] font-medium leading-tight">
                  Synthesized Findings & Analysis
                </h3>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!reportMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] text-xs font-medium transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#024F46]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!reportMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#024F46] hover:bg-[#013832] text-white text-xs font-medium transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#ECBA82]" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          {/* Scrollable Fixed Height Markdown Content Container (ChatGPT Style) */}
          <div className="relative">
            <div
              ref={reportContainerRef}
              onScroll={handleReportScroll}
              className="max-h-[560px] min-h-[240px] overflow-y-auto pr-4 pl-2 py-2 custom-scrollbar bg-[#FAF8F5]/40 rounded-2xl p-4 border border-[#E9E6E6] transition-all"
            >
              <div className="prose-editorial max-w-none">
                {reportMarkdown ? (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportMarkdown}
                    </ReactMarkdown>
                    {isStreaming && stage === 'synthesizer' && (
                      <span className="inline-block w-2.5 h-4 bg-[#024F46] animate-pulse ml-1 align-middle rounded-sm" />
                    )}
                  </>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-8 h-8 text-[#ECBA82] animate-pulse mb-3" />
                    <h4 className="font-editorial text-xl text-[#2E2E2E]">
                      Synthesizing exhaustive report with live citations...
                    </h4>
                    <p className="text-xs text-[#82817A] mt-1 max-w-md">
                      Synthesizer agent is actively compiling verified sources into publication-grade Markdown.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating "Scroll to bottom" button (ChatGPT style) */}
            {showScrollBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#024F46] text-[#ECBA82] text-xs font-medium shadow-lg hover:bg-[#013832] transition-all cursor-pointer animate-in fade-in active:scale-95 z-10"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Scroll to bottom</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
