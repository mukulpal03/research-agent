'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, maxDepth: number) => void;
  isLoading: boolean;
}

const SAMPLE_TOPICS = [
  'Latest breakthroughs in solid-state batteries in 2026',
  'Autonomous AI agent architectures compared: LangGraph vs AutoGen',
  'Commercial viability and timeline of fusion energy power plants',
  'How do quantum computing algorithms impact RSA cryptography today?',
];

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#FFFFFF] rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2 border-2 border-[#E9E6E6] focus-within:border-[#024F46] transition-all duration-200"
      >
        <div className="flex items-center gap-3 flex-1 w-full px-3 py-1.5">
          <Search className="w-5 h-5 text-[#82817A] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask any research question..."
            disabled={isLoading}
            className="w-full bg-transparent text-[#2E2E2E] placeholder-[#82817A] text-sm sm:text-base focus:outline-none font-normal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
          {/* Depth Settings */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] text-xs font-medium transition-colors cursor-pointer"
            title="Configure Depth"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#024F46]" />
            <span>Depth {maxDepth}</span>
          </button>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#024F46] hover:bg-[#013832] text-[#ECBA82] font-medium text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#ECBA82]" />
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

      {/* Depth Slider Dropdown */}
      {showSettings && (
        <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E9E6E6] flex items-center justify-between gap-4 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#2E2E2E]">Max Recursion Depth:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
              className="accent-[#024F46] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#024F46]">{maxDepth} rounds</span>
          </div>
          <span className="text-[#82817A] text-[11px] hidden sm:inline">
            {maxDepth === 1 ? '⚡ Fast triage' : maxDepth <= 3 ? '🔬 Multi-round depth' : '🚀 Exhaustive exploration'}
          </span>
        </div>
      )}

      {/* Sample Inquiry Chips */}
      {!isLoading && (
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-[#82817A] font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ECBA82]" />
            Inquiries:
          </span>
          {SAMPLE_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleChipClick(topic)}
              className="px-2.5 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#EBE8E2] text-[#57564C] text-[11px] transition-colors border border-[#E9E6E6] cursor-pointer truncate max-w-xs"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
