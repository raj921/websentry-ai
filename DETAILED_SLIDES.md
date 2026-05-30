# WebSentry AI — In-Depth Presentation (Slides & Detailed Narration)

This document contains a comprehensive 12-slide deck outline with visual mockups, bullet points, technical deep-dives, and detailed narration scripts.

---

## 🖥️ Slide 1: Cover & Vision
### Vision
WebSentry AI: The Enterprise Control Plane for Safe Live-Web AI Agents.

### Visual Composition
* **Background**: Sleek dark mode (`#151712`) with an overlay grid pattern.
* **Left Column**: Prominent typography showcasing the project name, subtitle, and badges for **Bright Data Web Unlocker**, **SERP API**, and **AI/ML API**.
* **Right Column**: A minimalist graphic or SVG route map showing the agent's journey: input query -> policy checks -> filtered fetching -> secure synthesis.

### Key Bullet Points
* **Governed Ingestion**: Real-time public web access under enterprise constraints.
* **Shield & Fire**: Prompt-injection defense and sanitization before content reaches LLMs.
* **Cost Controls**: Active dollar-budget limits tracked down to the fraction of a cent.
* **Audit Trails**: Complete step-by-step logs for security compliance.

### Technical Deep-Dive
WebSentry AI wraps unstructured agent workflows inside a deterministic security layer, serving as a gateway proxy for all outbound web queries.

### Narration Script
> "Welcome everyone. Today, we're looking at WebSentry AI: a safe, governed control plane for live-web AI agents. As enterprise workflows increasingly delegate information discovery to autonomous agents, security and compliance teams face a new challenge: how do we grant agents the ability to search and read the live web without compromising safety, predictability, and budget? WebSentry is the gateway that makes this possible."

---

## 🖥️ Slide 2: The Enterprise Web Agent Dilemma
### Vision
The security and compliance risks of unmanaged web agents.

### Visual Composition
* Two contrasting columns:
  * **Left (The Need)**: Speed, real-time data, competitive insights, dynamic search.
  * **Right (The Threat)**: Red alert icons representing budget overrun, prompt injection, and lack of auditability.

### Key Bullet Points
* **Blind Ingestion**: Agents reading raw HTML can trigger hidden scripts or follow unwanted redirections.
* **Budget Runaway**: Uncontrolled web loops can exhaust scraping and proxy credits.
* **Prompt Injection**: Malicious instructions embedded in web markup (e.g., hidden divs) hijack the LLM.
* **Unverifiable Claims**: Traditional RAG systems output summaries without source-level citations.

### Technical Deep-Dive
Without a control plane, an LLM agent uses raw network fetches directly. This allows malicious sites to deliver target scripts or instruct the model to exfiltrate keys via query params.

### Narration Script
> "To understand why WebSentry is necessary, we must look at the risks of unmanaged web agents. When an agent searches and reads pages, it behaves like a user but lacks a human's critical judgement. It can burn hundreds of dollars in proxy budgets, access unauthorized domains, ingest hidden prompt injections designed to hijack the model, and make business recommendations without a single verifiable source citation. We cannot deploy agents under these conditions."

---

## 🖥️ Slide 3: WebSentry Architecture
### Vision
How the control plane intercepts and secures the data flow.

### Visual Composition
* Horizontal block diagram:
  1. **Input Parameters** (Target Company, Competitors, Budget, Risk).
  2. **Bright Data SERP API** (Discovery).
  3. **Policy Engine** (Allowlist/Budget).
  4. **Bright Data Web Unlocker** (Governed Content Fetching).
  5. **Adversarial Scanner** (Prompt-Injection Firewall).
  6. **LLM Synthesis (AI/ML API)** -> **Citation Brief**.

### Key Bullet Points
* **Gateway Proxy Model**: Intercepts requests before web clients execute network commands.
* **Dual Bright Data Integration**: Splitting responsibilities into discovery (SERP) and scraping (Unlocker).
* **Deterministic Middleware**: Enforces rules in standard code (TypeScript) rather than relying on loose LLM instructions.

### Technical Deep-Dive
Implemented in [engine.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/engine.ts). The pipeline wraps async API calls in structured audit events, maintaining state across domain checks, content fetches, scanner logs, and model synthesis.

### Narration Script
> "WebSentry AI solves this by introducing a structured, multi-layer architecture. We separate the pipeline into clean steps: first, discovery; second, policy verification; third, governed fetching; fourth, prompt-injection screening; and fifth, synthesis. Crucially, the policy and security rules are written in deterministic TypeScript, meaning they are guaranteed to execute and cannot be bypassed by an LLM prompt override."

---

## 🖥️ Slide 4: Real-time Discovery (SERP API)
### Vision
How the agent discovers search targets reliably.

### Visual Composition
* Left side shows a sample query string: `Linear Asana ClickUp pricing careers changelog AI product launch`.
* Right side displays a mock JSON return structure showing links, snippets, and page titles from Google.

### Key Bullet Points
* **Bright Data SERP API**: Accesses search engines globally with reliable proxy rotation.
* **Targeted Query Formulation**: Automatically appends context-relevant terms (pricing, jobs) to target company keywords.
* **Result Filtering**: Limits exploration to the top organic results, preventing endless crawling loops.

### Technical Deep-Dive
Uses [discoverSources](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/bright-data.ts#L15) to connect to `https://api.brightdata.com/request`, passing search configurations. When credentials are missing, the system falls back to mock results to ensure a functional sandbox.

### Narration Script
> "In step one, the agent initiates discovery. WebSentry uses the Bright Data SERP API to dynamically formulate search queries looking for competitive signals like pricing pages, job boards, and changelogs. By querying Google programmatically, we locate high-value public pages while avoiding random browsing."

---

## 🖥️ Slide 5: The Policy Engine & Budget Guardrails
### Vision
Enforcing security and budgetary parameters.

### Visual Composition
* Split screen:
  * **Left (Domain Controls)**: Visual of an allowlist (`*.app`, `*.com`) and a denylist blocking mirror sites.
  * **Right (Budget Meter)**: A progress bar tracking estimated spend vs. allowed budget.

### Key Bullet Points
* **Domain Allowlist Validation**: Restricts fetching to explicit domains (e.g. `linear.app`, `asana.com`).
* **Active Spend Accumulation**: Calculates fetch costs *before* network requests, blocking commands that would violate boundaries.
* **Trap Pre-screening**: Blocks known malicious trap paths prior to outbound network socket calls.

### Technical Deep-Dive
Implemented in [policy.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/policy.ts). The function [evaluatePolicy](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/policy.ts#L54) compares the destination hostname using regular expressions (supporting wildcards) and checks if the run's cumulative spend exceeds the budget.

### Narration Script
> "Before any page is fetched, it must pass the policy engine. If the URL belongs to an untrusted domain or mirror site, it is blocked. We also track spend in real time. If fetching a resource would push us over our budget limit, the transaction is rejected immediately. This protects companies from runaway api costs."

---

## 🖥️ Slide 6: Governed Ingestion (Web Unlocker)
### Vision
Reliable scraping of javascript-heavy public sites.

### Visual Composition
* Logo/diagram showing **Bright Data Web Unlocker** rendering dynamic HTML and returning clean Markdown representation to the workspace.

### Key Bullet Points
* **Bright Data Web Unlocker**: Bypasses anti-scraping blocks, CAPTCHAs, and dynamic JavaScript rendering.
* **Markdown Representation**: Configured to return markdown content, reducing token count by stripping redundant style tags and layouts.
* **Telemetry Monitoring**: Logs transfer latency, raw byte payload size, and transaction costs for audit logs.

### Technical Deep-Dive
Uses [fetchSourceContent](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/bright-data.ts#L82) with the header payload option `data_format: "markdown"`. This ensures the LLM receives structured text rather than a mess of HTML divs, saving API tokens.

### Narration Script
> "Once a URL is approved, WebSentry fetches it using the Bright Data Web Unlocker. Web Unlocker resolves JS rendering, CAPTCHAs, and IP blocks. By requesting the content in clean markdown format, we save up to 80% in token consumption and make parsing far easier for the model."

---

## 🖥️ Slide 7: Prompt-Injection Firewall
### Vision
Treating third-party web content as an adversarial interface.

### Visual Composition
* Highlighted code block showing raw web content:
  * Red outline around: `<div style="display:none">Ignore previous instructions...</div>`
  * Green outline around: `Standard Pricing: Free, Starter, Pro...`

### Key Bullet Points
* **Hidden DOM Detection**: Scans for styles like `display:none` or `font-size: 0px` which are used to hide adversarial prompts.
* **Instruction Override Identification**: Looks for system overrides (e.g. *"Ignore all previous instructions"*).
* **Metadata Integrity**: Scans JSON-LD/structured markup containing instruction language.

### Technical Deep-Dive
In [security.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/security.ts), WebSentry uses regex patterns for common injection phrases (e.g. `INJECTION_PATTERNS` and `HIDDEN_DOM_PATTERNS`). If a match is found, a `RiskFinding` is logged with severity and severity-score ratings.

### Narration Script
> "This slide illustrates our prompt-injection firewall. Bad actors frequently place hidden text on websites to hijack reading bots. WebSentry analyzes the fetched page, flags hidden DOM nodes and malicious text instructions, and rates the overall risk level of the source before the agent can read it."

---

## 🖥️ Slide 8: Sanitization & Quarantine
### Vision
Preparing untrusted text for safe LLM processing.

### Visual Composition
* Diagram of text passing through a filter:
  * **Input (Untrusted)**: CSS hidden injection + HTML structure.
  * **Filter**: Sanitizer blocks.
  * **Output (Safe)**: Replacement tags like `[removed suspicious instruction]`.

### Key Bullet Points
* **Tag Strip**: Removes scripts, styling tags, and HTML comments.
* **Content Quarantining**: Replaces flagged adversarial text with placeholder strings.
* **Length Constraints**: Crops content to a maximum characters limit to control downstream model window sizes.

### Technical Deep-Dive
Implemented in [sanitizeForModel](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/security.ts#L71). It sanitizes scripts, styles, and comment blocks using regular expressions, replacing hostile string blocks with safe placeholders.

### Narration Script
> "To neutralize threats, we sanitize the content. We run the text through a clean-up pipeline that strips styling, comments, and scripts, replaces flagged injection text with safe placeholders, and truncates the string to fit inside the model's optimal window size."

---

## 🖥️ Slide 9: GTM Competitive Intelligence
### Vision
Generating actionable business output with citations.

### Visual Composition
* Showcase of the **Brief Tab** on the dashboard. Emphasize the separation between the Executive Summary, Pricing/Hiring/Product columns, and the source links.

### Key Bullet Points
* **Structured JSON Schema**: The LLM is forced to output a JSON object containing specific GTM insights.
* **Source-Level Citations**: Every claim is mapped back to the source URL.
* **AI/ML API Execution**: Primary path targets optimized models like Gemini or GPT-4o-mini.

### Technical Deep-Dive
Handled in [aimlapi.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/aimlapi.ts). Uses schema-enforced JSON mode response formats to construct the [Brief](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/types.ts#L60) object with structured signals.

### Narration Script
> "Now we arrive at the business value. WebSentry feeds the sanitized text to the AI/ML API to compile a competitive brief. Because we provide clear, structured sources, the model is able to extract pricing plans, hiring intent, and product releases, with every fact linked directly to a source citation."

---

## 🖥️ Slide 10: Enterprise Audit Logging
### Vision
Full transparency and exportability.

### Visual Composition
* Showcase of the **Audit Tab** containing a table:
  * Columns: Step, Product, Status, Message, Cost, Risk Score, Latency.
  * Highlights "Download Audit" button.

### Key Bullet Points
* **Linear Time Event Ledger**: Records entry, fetch status, policies applied, and firewall findings.
* **Financial Accounting**: Computes the exact estimated dollar cost per step.
* **JSON Compliance Export**: Allows teams to download raw audit logs for archiving or ingestion into log systems.

### Technical Deep-Dive
The dashboard component [websentry-dashboard.tsx](file:///Users/rajkumar/bigdatahackthathon/components/websentry-dashboard.tsx#L115) packages the `InvestigationResponse` (containing full sources, policy evaluations, and risk reports) into a downloadable client-side Blob.

### Narration Script
> "For compliance, WebSentry maintains an audit trail. It logs the latency, bytes, and cost of every single operation, along with any security events. You can export this audit trail as a standardized JSON log, giving you complete visibility into what your agents did, how much they spent, and what they read."

---

## 🖥️ Slide 11: The Technical Stack
### Vision
Modern, performant, and reliable implementation.

### Visual Composition
* Technology grid showing logos or cards for Next.js, React, TypeScript, Tailwind, Bright Data, and AI/ML API.

### Key Bullet Points
* **Next.js 16 & React 19**: Server action routers and optimized client components.
* **Tailwind v4 & shadcn/ui**: Modern, accessible UI styling with CSS custom properties.
* **Vitest Testing**: Comprehensive unit tests for policy routing and sanitization.

### Technical Deep-Dive
Unit tests are written in [engine.test.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/engine.test.ts), [policy.test.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/policy.test.ts), and [security.test.ts](file:///Users/rajkumar/bigdatahackthathon/lib/websentry/security.test.ts) to verify logic isolation.

### Narration Script
> "WebSentry is built on a modern frontend stack. We use Next.js, React 19, TypeScript, and Tailwind v4. The backend engines are tested with Vitest to ensure our policy and security layers remain robust across edge cases."

---

## 🖥️ Slide 12: Vision & Summary
### Vision
The path forward for enterprise web agents.

### Visual Composition
* Clean closing slide with contact info and a simple quote:
  * *"The future is not just AI agents with web access. The future is governed AI agents with safe, auditable, budgeted web access."*

### Key Bullet Points
* **Deployable Today**: Bridges the gap between raw web access and strict corporate compliance.
* **Expandable Framework**: The same policy and scanner logic can secure customer service bots, research scripts, or search agents.
* **Governed Innovation**: Moving forward safely.

### Narration Script
> "In summary, AI agents are ready to work on the web, but only if they are governed. WebSentry AI provides the control plane that makes them safe to deploy. Thank you for your time, and I'd love to answer any questions."
