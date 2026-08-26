'use client';

import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string, maxDepth: number) => void;
  isLoading: boolean;
  isCompact?: boolean;
}

const SAMPLE_TOPICS = [
  'Latest breakthroughs in solid-state batteries in 2026',
  'Autonomous AI agent architectures compared: LangGraph vs AutoGen',
  'Commercial viability and timeline of fusion energy power plants',
  'How do quantum computing algorithms impact RSA cryptography today?',
];

export function SearchHero({ onSearch, isLoading, isCompact }: SearchHeroProps) {
  const [query, setQuery] = useState('');
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), maxDepth);
  };

  const handleChipClick = (topic: string) => {
    setQuery(topic);
    onSearch(topic, maxDepth);
  };

  if (isCompact) {
    return (
      <section className="w-full bg-[#024F46] text-white py-6 px-6 rounded-b-[40px] shadow-md transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          {/* Prompt Input Form in Compact Mode */}
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-2xl p-2 shadow-lg flex flex-col md:flex-row items-center gap-2 border-2 border-[#E9E6E6] focus-within:border-[#ECBA82]"
          >
            <div className="flex items-center gap-3 flex-1 w-full px-3 py-1">
              <Search className="w-5 h-5 text-[#82817A] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a new research question..."
                disabled={isLoading}
                className="w-full bg-transparent text-[#2E2E2E] placeholder-[#82817A] text-sm md:text-base focus:outline-none font-normal"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-1 md:pt-0">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] text-xs font-medium transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#024F46]" />
                <span>Depth {maxDepth}</span>
              </button>

              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ECBA82] hover:bg-[#e5ab6d] text-[#024F46] font-medium text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#024F46]" />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <span>New inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Depth Settings dropdown */}
          {showSettings && (
            <div className="mt-3 p-4 rounded-2xl bg-[#013832] text-white border border-white/10 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-medium text-[#ECBA82]">Max Recursion Depth:</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
                  className="accent-[#ECBA82] cursor-pointer"
                />
                <span className="font-mono font-bold text-[#ECBA82]">{maxDepth} rounds</span>
              </div>
              <span className="text-white/60 text-[11px]">
                {maxDepth === 1 ? 'Fast' : maxDepth <= 3 ? 'Standard recursive depth' : 'Exhaustive exploration'}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#024F46] text-white pt-8 pb-16 md:pb-20 rounded-b-[48px] md:rounded-b-[80px] shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Editorial Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#ECBA82] text-xs font-medium mb-6 backdrop-blur-sm border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recursive Multi-Agent Intelligence</span>
        </div>

        {/* Display Heading */}
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight leading-[1.15] mb-5">
          Uncover verified depth with autonomous agents.
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-lg md:text-xl font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
          Ask any multifaceted question. Our research agents decompose, discover, evaluate, and synthesize an exhaustive, citation-backed report.
        </p>

        {/* Prompt Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-2xl p-2.5 shadow-xl flex flex-col md:flex-row items-center gap-2 border-2 border-[#E9E6E6] focus-within:border-[#ECBA82] transition-all duration-200"
        >
          <div className="flex items-center gap-3 flex-1 w-full px-3 py-1.5">
            <Search className="w-5 h-5 text-[#82817A] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What topic would you like our agents to research?"
              disabled={isLoading}
              className="w-full bg-transparent text-[#2E2E2E] placeholder-[#82817A] text-base focus:outline-none font-normal"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E9E6E6]">
            {/* Depth Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] text-xs font-medium transition-colors cursor-pointer"
              title="Configure Research Depth"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#024F46]" />
              <span>Depth {maxDepth}</span>
            </button>

            {/* Primary Action Button (Brand Amber) */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ECBA82] hover:bg-[#e5ab6d] text-[#024F46] font-medium text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#024F46]" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <span>Begin research</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Optional Depth Slider Expansion */}
        {showSettings && (
          <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left max-w-md mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs text-white/90 mb-2">
              <span className="font-medium">Recursive Search Rounds (Max Depth)</span>
              <span className="font-bold text-[#ECBA82]">{maxDepth} Rounds</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
              className="w-full accent-[#ECBA82] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/60 mt-1 font-mono">
              <span>1 (Fast Overview)</span>
              <span>3 (Standard Deep)</span>
              <span>5 (Exhaustive)</span>
            </div>
          </div>
        )}

        {/* Sample Inquiry Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-white/60 font-sans mr-1">Suggested inquiries:</span>
          {SAMPLE_TOPICS.map((topic, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(topic)}
              disabled={isLoading}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all cursor-pointer border border-white/10 active:scale-95 truncate max-w-xs md:max-w-none text-left"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
