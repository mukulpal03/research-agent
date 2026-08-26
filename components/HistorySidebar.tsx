'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, ArrowUpRight, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SessionSummary {
  id: string;
  query: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  depth: number;
  maxDepth: number;
  totalSources: number;
  hasReport: boolean;
  decision?: string;
  durationMs?: number;
  createdAt: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  currentSessionId?: string;
}

export function HistorySidebar({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId,
}: HistorySidebarProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching past sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col p-6 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#E9E6E6]">
          <div>
            <h2 className="font-editorial text-2xl text-[#2E2E2E] font-normal">
              Research Archive
            </h2>
            <p className="text-xs text-[#82817A] mt-0.5">
              In-memory sessions and synthesized reports
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F5F5F5] hover:bg-[#EBE8E2] text-[#57564C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search filter input */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-[#82817A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past research..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F5F5F5] text-[#2E2E2E] placeholder-[#82817A] border border-[#E9E6E6] focus:outline-none focus:border-[#024F46]"
          />
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#82817A] gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[#024F46]" />
              <span>Loading archive...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-[#82817A] text-sm font-sans">
              <FileText className="w-8 h-8 mx-auto text-[#D5D3CE] mb-2" />
              <p>No research sessions found.</p>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isSelected = s.id === currentSessionId;
              const duration = s.durationMs
                ? `${(s.durationMs / 1000).toFixed(1)}s`
                : null;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#FAF8F5] border-[#024F46]'
                      : 'bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] border-[#E9E6E6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-editorial text-base text-[#2E2E2E] font-medium leading-snug line-clamp-2">
                      {s.query}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#82817A] hover:text-red-600 transition-opacity"
                      title="Delete from memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#82817A] font-sans pt-2 border-t border-[#E9E6E6]/60">
                    <div className="flex items-center gap-2">
                      {s.status === 'completed' && (
                        <span className="flex items-center gap-1 text-[#024F46] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{s.decision === 'direct_answer' ? 'Direct' : 'Deep'}</span>
                        </span>
                      )}
                      {s.status === 'running' && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Running</span>
                        </span>
                      )}
                      {s.status === 'failed' && (
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                      {s.totalSources > 0 && (
                        <span>• {s.totalSources} sources</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#82817A]" />
                      <span>
                        {new Date(s.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
