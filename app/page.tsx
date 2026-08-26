"use client";

import React from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { AgentChatFeed } from "../components/AgentChatFeed";
import { useResearchStream } from "../hooks/useResearchStream";
import { AlertCircle, Compass } from "lucide-react";

export default function HomePage() {
  const {
    session,
    stage,
    statusMessage,
    isStreaming,
    error,
    subQueries,
    sources,
    reportMarkdown,
    workers,
    logs,
    startResearch,
    reset,
  } = useResearchStream();

  const handleSearch = (query: string, maxDepth: number) => {
    startResearch(query, maxDepth);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      {/* Navigation Header */}
      <Header onNewSearch={reset} />

      {/* Main Workspace Flow */}
      <main className="flex-1 pb-20 px-6 pt-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Sleek Top Search & Depth Input Bar */}
          <SearchBar onSearch={handleSearch} isLoading={isStreaming} />
          {/* Terminal-Inspired Multi-Agent Chat & Execution Timeline */}
          {session && (
            <AgentChatFeed
              session={session}
              stage={stage}
              isStreaming={isStreaming}
              subQueries={subQueries}
              sources={sources}
              reportMarkdown={reportMarkdown}
              workers={workers}
              error={error}
            />
          )}

          {/* Empty / Resting State */}
          {!session && (
            <div className="py-16 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] text-[#024F46] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-2xl text-[#2E2E2E] font-normal">
                Awaiting your research inquiry
              </h3>
              <p className="text-sm text-[#82817A] mt-2 leading-relaxed">
                Enter any question above to watch Gatekeeper, Planner,
                Researchers, Critic, and Synthesizer coordinate in real time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E9E6E6] py-8 text-center text-xs text-[#82817A] font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base text-[#2E2E2E]">
              Deep Research Agent
            </span>
            <span>• Built with LangGraph, Bedrock / OpenAI & Tavily</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
