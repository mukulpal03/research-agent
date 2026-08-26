# ⚡ Deep Research Agent — Next.js Fullstack Transformation Plan

Complete step-by-step roadmap to pivot into a unified **Next.js (App Router)** fullstack application. 

One codebase, one server (`pnpm dev`), zero CORS issues, instant 1-click Vercel/Docker deployment, and 100% reuse of our LangGraph agent core.

---

## 🏗️ Next.js Architecture

```text
research-agent/
├── app/
│   ├── api/
│   │   ├── research/
│   │   │   └── route.ts             # POST: Create session & execute
│   │   ├── research/[id]/
│   │   │   └── stream/
│   │   │       └── route.ts         # GET: Native Web Streams SSE endpoint
│   │   ├── reports/
│   │   │   ├── route.ts             # GET: List all sessions
│   │   │   └── [id]/route.ts        # GET/DELETE: Single session & report
│   │   └── config/
│   │       └── route.ts             # GET: Active models and environment defaults
│   ├── layout.tsx                   # Root layout with Organic fonts & theme
│   ├── page.tsx                     # Main Dashboard UI (Hero, Stepper, Sources, Markdown Report)
│   └── globals.css                  # Organic Design System tokens & prose styles
├── components/
│   ├── Header.tsx                   # Brand topbar with archive trigger
│   ├── SearchHero.tsx               # Deep teal #024F46 signature hero with amber #ECBA82 action
│   ├── AgentStepper.tsx             # Visual pipeline (Gatekeeper ➔ Planner ➔ Researcher ➔ Critic ➔ Synthesizer)
│   ├── SourcesGrid.tsx              # Borderless white panel source cards with favicons & topic tags
│   ├── ReportViewer.tsx             # Editorial Markdown viewer with serif headings & inline clickable citations
│   └── HistorySidebar.tsx           # In-memory research session archive drawer
├── hooks/
│   └── useResearchStream.ts         # React hook for SSE stream consumption
├── lib/
│   ├── types.ts                     # Session & SSE message types
│   ├── memoryStore.ts               # Global in-memory session manager
│   ├── events.ts                    # Native Web Stream SSE broadcaster
│   └── services/
│       └── researchService.ts       # LangGraph background execution coordinator
├── src/                             # 🧠 100% REUSED AGENT CORE (Untouched & Shared!)
│   ├── agents/
│   ├── config/
│   ├── graph/
│   ├── prompts/
│   ├── schemas/
│   ├── services/
│   └── state/
├── package.json
└── tsconfig.json
```

---

## 📌 Implementation Checklist & Tracker

- [x] **Phase 1: Next.js & Tailwind Setup**
  - [x] **Step 1.1**: Install Next.js, React, TailwindCSS, Lucide icons, and Markdown renderers (`next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `react-markdown`, `remark-gfm`).
  - [x] **Step 1.2**: Configure `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, and `app/globals.css`.

- [x] **Phase 2: In-Memory Store & SSE API Routes**
  - [x] **Step 2.1**: Set up in-memory store and types in `lib/memoryStore.ts`, `lib/types.ts`, and `lib/events.ts`.
  - [x] **Step 2.2**: Build Next.js App Router Route Handlers:
    - `app/api/research/route.ts` (POST)
    - `app/api/research/[id]/stream/route.ts` (Native Web SSE `ReadableStream`)
    - `app/api/reports/route.ts` & `app/api/reports/[id]/route.ts`
    - `app/api/config/route.ts`
  - [x] **Step 2.3**: Built background coordinator in `lib/services/researchService.ts`.

- [x] **Phase 3: Frontend Custom Hook & Core Components**
  - [x] **Step 3.1**: Implemented `hooks/useResearchStream.ts` for real-time SSE stream consumption.
  - [x] **Step 3.2**: Built `components/Header.tsx` (Organic editorial brand navbar).
  - [x] **Step 3.3**: Built `components/SearchHero.tsx` (Deep Teal `#024F46` hero, bottom 80px curve, pale amber `#ECBA82` button, depth slider, presets).
  - [x] **Step 3.4**: Built `components/AgentStepper.tsx` (Borderless white panel visual DAG pipeline).
  - [x] **Step 3.5**: Built `components/SourcesGrid.tsx` (Discovered web sources with topic badges and external links).
  - [x] **Step 3.6**: Built `components/ReportViewer.tsx` (Editorial Markdown with Georgia serif headings, citation links, copy & download).
  - [x] **Step 3.7**: Built `components/HistorySidebar.tsx` (Organic slide-over research archive drawer).

- [x] **Phase 4: Dashboard Page Assembly & Verification**
  - [x] **Step 4.1**: Assembled full dashboard in `app/page.tsx` & `app/layout.tsx`.
  - [x] **Step 4.2**: Verified full codebase compilation with `tsc --noEmit` (0 errors).

---

🎉 **All phases and steps are 100% complete!**
