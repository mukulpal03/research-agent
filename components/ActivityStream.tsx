'use client';

import React from 'react';
import { Terminal, Search, CheckCircle2, Loader2, AlertCircle, Cpu } from 'lucide-react';
import type { WorkerStatusPayload, LogMessagePayload, ResearchStage } from '@/lib/types';

interface ActivityStreamProps {
  workers: WorkerStatusPayload[];
  logs: LogMessagePayload[];
  stage: ResearchStage;
  isStreaming: boolean;
}

export function ActivityStream({
  workers,
  logs,
  stage,
  isStreaming,
}: ActivityStreamProps) {
  if (!isStreaming && logs.length === 0 && workers.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E9E6E6]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#024F46] text-[#ECBA82] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl text-[#2E2E2E] font-normal">
              Live Agent Execution & Worker Feed
            </h2>
            <p className="text-xs text-[#82817A] mt-0.5 font-sans">
              Real-time telemetry, concurrent sub-query workers, and multi-agent coordination
            </p>
          </div>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E9E6E6] text-[#024F46] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#024F46] animate-ping" />
            <span>Streaming Live</span>
          </div>
        )}
      </div>

      {/* Concurrent Worker Cards Grid */}
      {workers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#82817A] mb-3">
            Concurrent Researcher Workers ({workers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workers.map((worker) => (
              <div
                key={worker.workerIndex}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                  worker.status === 'searching'
                    ? 'bg-[#FAF8F5] border-[#024F46] shadow-sm'
                    : worker.status === 'completed'
                    ? 'bg-[#F5F5F5] border-[#E9E6E6]'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    worker.status === 'searching'
                      ? 'bg-[#024F46] text-[#ECBA82]'
                      : worker.status === 'completed'
                      ? 'bg-[#024F46]/10 text-[#024F46]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {worker.status === 'searching' && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#ECBA82]" />
                  )}
                  {worker.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-[#024F46]" />
                  )}
                  {worker.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-[#024F46]">
                      Worker {worker.workerIndex}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        worker.status === 'searching'
                          ? 'bg-[#ECBA82]/30 text-[#024F46] animate-pulse'
                          : worker.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {worker.status === 'searching'
                        ? 'Searching web...'
                        : worker.status === 'completed'
                        ? `✓ ${worker.sourcesCount ?? 0} sources`
                        : 'Failed'}
                    </span>
                  </div>

                  <p className="text-xs text-[#57564C] truncate mt-1">
                    "{worker.query}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Activity Timeline Log */}
      {logs.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 text-[#F5F5F5] font-mono text-xs max-h-56 overflow-y-auto space-y-2">
          <div className="flex items-center gap-2 text-[#ECBA82] pb-2 border-b border-white/10 text-[11px] font-sans font-medium uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Agent Telemetry Log</span>
          </div>

          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-white/40 shrink-0 text-[10px]">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
              </span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warn'
                    ? 'text-amber-300'
                    : log.type === 'error'
                    ? 'text-red-400'
                    : 'text-white/80'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
