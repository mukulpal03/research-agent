'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { ResearchSession } from '@/lib/types';

interface ReportViewerProps {
  markdown: string;
  session: ResearchSession | null;
  isStreaming?: boolean;
}

export function ReportViewer({
  markdown,
  session,
  isStreaming,
}: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!markdown && !isStreaming) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `research-report-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const durationFormatted = session?.durationMs
    ? `${(session.durationMs / 1000).toFixed(1)}s`
    : null;

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 md:p-10 shadow-sm border border-transparent">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E9E6E6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ECBA82] text-[#024F46] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl text-[#2E2E2E] font-normal leading-tight">
              Synthesized Research Report
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#82817A] mt-1 font-sans">
              {session?.createdAt && (
                <span>
                  {new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {durationFormatted && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Synthesized in {durationFormatted}</span>
                </span>
              )}
              {isStreaming && (
                <span className="flex items-center gap-1 text-[#024F46] font-medium animate-pulse">
                  <Sparkles className="w-3 h-3 text-[#ECBA82]" />
                  <span>Live compiling...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Organic Sentence Case) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] text-xs font-medium transition-colors cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#024F46]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#024F46] hover:bg-[#013832] text-white text-xs font-medium transition-colors cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#ECBA82]" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Editorial Prose Markdown Content */}
      <div className="prose-editorial max-w-none">
        {markdown ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-[#ECBA82] animate-pulse mb-3" />
            <h3 className="font-editorial text-xl text-[#2E2E2E]">
              Synthesizing exhaustive report with live citations...
            </h3>
            <p className="text-xs text-[#82817A] mt-1 max-w-md">
              The Synthesizer agent is compiling all approved research findings into structured markdown. Tokens will stream in real time below.
            </p>
          </div>
        )}
      </div>

      {/* Footer Meta Note */}
      <div className="mt-12 pt-6 border-t border-[#E9E6E6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#82817A] gap-2">
        <span>
          Autonomous Deep Research Report • Generated with LangGraph and Tavily Web Intelligence
        </span>
        <span className="text-[#024F46] font-medium">
          Organic Multi-Agent System
        </span>
      </div>
    </div>
  );
}
