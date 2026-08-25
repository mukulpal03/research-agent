# Decision Note

## 1. Architecture & Approach

![alt text](image.png)

### Agent Roles & Responsibilities

*   **Gatekeeper Agent:** Acts as the entry point. Evaluates the user query to determine if it requires deep, recursive research or if it can be answered immediately as a simple direct response.
*   **Planner Agent:** Receives complex queries from the Gatekeeper. Its sole responsibility is to break down the main query into a distinct sub-questions required to form a complete answer.
*   **Researcher Agent(s):** Takes a single sub-question, queries the search API and extracts the most relevant information. To minimize latency, multiple Researchers are spun up concurrently to handle all sub-questions simultaneously.
*   **Critic Agent:** The evaluator of the system. It reviews all aggregated findings against the original query. If the information is incomplete, it generates new, targeted sub-queries and routes them back to the Researchers. It enforces the `max_depth` budget to prevent runaway loops.
*   **Synthesizer Agent:** Activated only when the Critic is satisfied (or the budget is hit). It compiles all approved research into the final, cited report.

## 2. Alternatives Considered & Rejected

*   **Hierarchical "Supervisor-Worker"** Considered using a  "Manager LLM" to dynamically decide when to spawn researchers and when to stop. **Rejected because:** It can get wildly expensive and also relying purely on an LLM for control flow is slow, unpredictable, and risks exceeding API budgets.
*   **Blackboard / Shared Memory Architecture:** Considered an architecture where agents do not communicate directly, but instead read and write tasks to a global "Blackboard" database asynchronously. **Rejected because:** Often overkill for a small project. Can lead to race conditions or agents overwriting each other if not carefully managed.

## 3. Technology Choices

*   **LLM Choice:** For our system, I used `gpt-4o-mini` uniformly to ensure low latency and minimal cost. **However, in a production environment, this uniform approach is suboptimal.** Ideally, we would use smaller, faster models for the Gatekeeper, Researcher, and Synthesizer, where tasks are straightforward extraction and formatting. Conversely, we would use stronger, high-reasoning models (like `GPT-5.6 Sol` or `Claude Opus 5`) for the **Planner** and **Critic**. In real-world scenarios, breaking down a complex query and critically evaluating data gaps requires significant reasoning capabilities that smaller models lack. (I read somewhere that even Anthropic says this - to use stronger models like Mythos for planning, and smaller models like Sonnet for executing).
*   **Search API:** I opted for the Tavily API. As per my research, Tavily searches based on keywords and facts, returning a highly summarized output instead of raw text. The obvious trade-off here is speed over depth. I also considered Firecrawl, which scrapes the entire page (giving you full depth and the complete output), as well as Exa, which searches on a semantic basis. We could have even used a hybrid approach (getting URLs from Tavily or Exa and then manually scraping the web pages) but I think that would be total overkill for this. Ultimately, for a fast, recursive multi-agent loop, optimizing for speed and pre-summarized context (Tavily) made the most sense.

## 4. Cost Control & Parallelism

There was a thing mentioned in the PRD asking if I made it "regardless of the cost". I think whosoever is building AI systems today (be it a company or a solo dev) the thing they care about and worry about the most is cost :) Because as we all know, AI systems can get wildly expensive.

*   **The Gatekeeper:** The reason I introduced a Gatekeeper agent is exactly that. A few days back, I was exploring a research product, and what happens there is even if I type a simple query like "Hi", it goes into full research mode, which definitely burns a lot of tokens. That's why I added this.
*   **Cost-Aware Decisions:** Most of the things I added were done with cost in mind :) Like using Tavily instead of Tavily + Firecrawl, using smaller models for non-reasoning tasks, and keeping the recursion depth lower.
*   **Recursion Budget:** For our system, I've hard-coded the limit to a strict `MAX_DEPTH = 2`. However, what I think is we should ideally let the agent decide the depth because each query can have different complexity. But we should still limit it to some extent so that the LLM doesn't push the depth beyond a limit for obvious cost reasons.
*   **Parallelism:** To minimize total time-to-completion, the orchestration layer executes the Researcher nodes concurrently. Fetching multiple sub-queries simultaneously prevents network bottlenecks.
*   **The Balance:** But I think we should keep a balance. It shouldn't be that in the effort to reduce costs, our system becomes trash. There should always be a balance.

## 5. What We Might Build (Or Skip) If I Get Time

If I end up getting some spare time at the end, here are a few things I might wire up:

*   **The "Swappable Config" Pattern:** Allowing us to easily hot-swap LLM providers (e.g. from OpenAI to Anthropic) via a simple config file.
*   **The Final Reflection Pass:** A final node where the system re-reads its own synthesized report and does one last check for any hidden gaps.
*   **Cost & Latency Tracking:** Adding basic telemetry to log exactly how many tokens we burned and the total execution time for the recursive loop.
*   **A Simple Web UI:** Wiring up a very basic frontend just to make the agent easier to interact with instead of just running it in the terminal.

But for now, my whole focus is strictly on making the actual agent logic as robust and effective as possible.