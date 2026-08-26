# Deep Research Multi-Agent System

Think of this as your own personal team of researchers. You give them a complex question, and instead of just spitting out a generic AI response, the team actually breaks your question down, scours the web for up-to-date information, filters out the garbage, and writes you a detailed, highly accurate report.

## 🧠 System Architecture

The core logic revolves around a directed state graph (LangGraph) that passes a strictly typed payload (`ResearchState`) between agents. 

![System Architecture](image.png)

### The Agents
1. **Gatekeeper Agent:** Acts as the entry point. Evaluates the user query to determine if it requires deep, recursive research or if it can be answered immediately as a simple direct response (saving API costs).
2. **Planner Agent:** Receives complex queries from the Gatekeeper. It breaks down the main query into distinct, non-overlapping sub-questions.
3. **Researcher Agent(s):** Takes the sub-questions and queries the web concurrently (via the Tavily API). It implements in-memory deduplication and fault-tolerant batching.
4. **Critic Agent:** Evaluates the gathered research against the original query. It actively purges irrelevant/hallucinatory sources (Garbage Collection) and decides whether to route back to the Researcher for more data or proceed to synthesis. It enforces a strict `MAX_DEPTH` budget.
5. **Synthesizer Agent:** Activated only when the Critic is satisfied (or the budget is hit). It compiles all approved research into the final markdown report.

## 📂 Folder Structure

The codebase is organized modularly to separate agent logic, state management, and external services:

```text
research-agent/
├── src/
│   ├── agents/         # LangGraph node handlers (Gatekeeper, Planner, Researcher, Critic, Synthesizer)
│   ├── config/         # Environment variable validation & configuration
│   ├── graph/          # LangGraph StateGraph initialization & conditional routing edges
│   ├── prompts/        # System prompts and instructions for each AI agent
│   ├── schemas/        # Zod schemas for strict JSON output from LLMs
│   ├── services/       # External API clients (LLM providers, Tavily search API)
│   ├── state/          # LangGraph state annotations (ResearchState payload)
│   ├── types/          # TypeScript interface definitions
│   ├── utils/          # Helper utilities (Date formatting, CLI loggers)
│   └── index.ts        # Main entry point and CLI infinite chat loop
├── .env.example        # Example environment variables
├── package.json        # Project dependencies (pnpm)
├── DECISION_DOC.md     # Detailed architectural decisions and trade-offs
└── README.md           # You are here!
```

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- `pnpm` package manager
- API Keys for **AWS Bedrock** (or OpenAI) and **Tavily Search**.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/mukulpal03/research-agent.git
cd research-agent

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables
Copy the example environment file and fill in your API credentials:
```bash
cp .env.example .env
```
Inside your `.env` file, ensure you have set:
- `LLM_PROVIDER` (e.g., `bedrock` or `openai`)
- `BEDROCK_API_KEY` (if using AWS Bedrock)
- `BEDROCK_FAST_MODEL` (e.g., `mistral.ministral-3-14b-instruct`)
- `BEDROCK_REASONING_MODEL` (e.g., `mistral.mistral-large-3-675b-instruct`)
- `TAVILY_API_KEY`
- `MAX_DEPTH` (Recommendation: `2` or `3`)
- `MAX_RESULTS_PER_QUERY` (Recommendation: `15`)

> [!NOTE]
> **Recommended Bedrock Models:**
> I strongly recommend using the **Mistral** models on AWS Bedrock:
> - **Fast Model:** `mistral.ministral-3-14b-instruct`
> - **Reasoning Model:** `mistral.mistral-large-3-675b-instruct`
> 
> Most other Bedrock models were throwing configuration and formatting errors during development, so the agent has been primarily developed, tested, and optimized with Mistral. 
> 
> *Alternatively, you can also use the **OpenAI** provider (`LLM_PROVIDER=openai`) with `OPENAI_API_KEY`, `OPENAI_FAST_MODEL=gpt-4o-mini`, and `OPENAI_REASONING_MODEL=gpt-4o`. Or GPT-5 family*

### 3. Run the Agent
The application features a continuous chat loop. You can start it in development mode using `tsx`:

```bash
pnpm dev
```

Once running, simply type your query in the terminal. The system will autonomously evaluate, plan, research, and generate a final `.md` report in the root directory!
