'use client';

import React from 'react';
import { Globe, ExternalLink, BookOpen } from 'lucide-react';
import type { ResearchFinding } from '@/src/state';

interface SourcesGridProps {
  sources: ResearchFinding[];
  isLoading?: boolean;
}

export function SourcesGrid({ sources, isLoading }: SourcesGridProps) {
  if (!sources || sources.length === 0) {
    if (isLoading) {
      return (
        <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 md:p-8 shadow-sm text-center">
          <div className="flex items-center justify-center gap-3 text-[#57564C]">
            <Globe className="w-5 h-5 animate-pulse text-[#024F46]" />
            <span className="font-editorial text-lg">
              Agents actively crawling verified web sources...
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#E9E6E6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#024F46]/10 text-[#024F46] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-editorial text-2xl text-[#2E2E2E] font-normal">
              Verified Primary Sources ({sources.length})
            </h2>
            <p className="text-xs text-[#82817A] mt-0.5">
              Extracted facts and live citations utilized in report synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source, index) => {
          let domain = '';
          try {
            if (source.url) {
              const u = new URL(source.url);
              domain = u.hostname.replace(/^www\./, '');
            }
          } catch {}

          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E6E6] hover:border-[#024F46]/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Domain & Index Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-[#024F46] text-[#ECBA82] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-mono text-[#024F46] truncate">
                      {domain || 'Web Source'}
                    </span>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#82817A] group-hover:text-[#024F46] transition-colors p-1"
                      title="Open source in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-editorial text-base text-[#2E2E2E] font-medium leading-snug line-clamp-2 mb-2">
                  {source.title || 'Untitled Reference'}
                </h3>

                {/* Content Snippet */}
                <p className="text-xs text-[#57564C] line-clamp-3 leading-relaxed">
                  {source.content}
                </p>
              </div>

              {/* Sub-Query Tag */}
              {source.query && (
                <div className="mt-3 pt-2.5 border-t border-[#E9E6E6] flex items-center gap-1.5">
                  <span className="text-[10px] text-[#82817A] uppercase tracking-wider font-semibold">
                    Topic:
                  </span>
                  <span className="text-[11px] text-[#57564C] truncate italic">
                    "{source.query}"
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
