'use client';

import React from 'react';
import { Sparkles, History, Compass } from 'lucide-react';

interface HeaderProps {
  onNewSearch: () => void;
}

export function Header({ onNewSearch }: HeaderProps) {
  return (
    <header className="w-full bg-[#024F46] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onNewSearch}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#ECBA82] flex items-center justify-center text-[#024F46] transition-transform duration-200 group-hover:scale-105 shadow-sm">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="font-editorial text-2xl tracking-tight leading-none text-white flex items-center gap-2">
              Deep Research
              <span className="text-xs tracking-normal font-sans font-medium px-2 py-0.5 rounded-full bg-white/15 text-[#ECBA82]">
                Agentic
              </span>
            </div>
            <p className="text-xs text-white/70 font-sans mt-0.5">
              Autonomous multi-agent synthesis
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer border border-white/10 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#ECBA82]" />
            <span>New Research</span>
          </button>
        </div>
      </div>
    </header>
  );
}
