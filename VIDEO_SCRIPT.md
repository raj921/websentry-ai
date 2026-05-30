# WebSentry AI — Video Presentation Script

> Target length: ~2:45. Spoken lines are in quotes. Screen actions are in [brackets].
> The app auto-runs the Linear demo on page load, so the dashboard is already populated when you open it.

---

## Pre-recording checklist

- `npm run dev` running, browser open at `http://localhost:3000`
- `.env.local` has Bright Data + AI/ML API keys (your run returns live `bright-data-aimlapi` mode)
- Brief tab selected, page fully loaded (top-right "Spend" and "Sources" metrics filled in)
- Window sized so the left Run control panel and the right tabs are both visible
- Validation proof ready in a terminal tab: typecheck, tests (9/9), lint, and build all pass

---

## 0:00 – 0:18 — Hook + Problem

[Screen: top hero header with the WebSentry AI title and the three badges — "Web Data UNLOCKED", "Bright Data control plane", "AI/ML API primary".]

"AI agents can now browse the live web. That's powerful, and it's risky. An unmanaged agent can hit unauthorized domains, burn through API budget, swallow hidden prompt injections, and hand you business claims with zero sources."

"WebSentry AI is the governance layer that makes live-web agents safe to deploy."

---

## 0:18 – 0:40 — What it is + the input panel

[Screen: left side "Run control" panel. Point to each field as you say it.]

"Everything starts with policy. On the left I set the target company — Linear — its competitors Asana and ClickUp, and the only domains the agent is allowed to touch."

[Point to Budget USD and Risk mode.]

"I cap the budget at two dollars, set a risk tolerance, and pick the focus areas: pricing, hiring, product launches, positioning."

[Click "Run WebSentry demo". The button shows the spinning radar.]

"One click runs the whole governed pipeline."

---

## 0:40 – 1:05 — Discovery + the metrics

[Screen: top-right metric cards — Sources, Blocked, Spend, Risk hits — update with real numbers.]

"WebSentry uses Bright Data SERP API to discover the real public sources — pricing pages, careers pages, changelogs, product launches."

[Point to the Spend metric and the "Budget guardrail" card on the lower left.]

"Every request is metered against the budget in real time. The guardrail shows spend used and budget remaining, and the products-used panel confirms which Bright Data services actually ran."

---

## 1:05 – 1:35 — Agent timeline + policy

[Screen: click the "Agent" tab. Show the 21st.dev agent tool timeline — SearchTool, then the Bright Data scrape_as_markdown MCP tool, then the policy_gate tool.]

"This is the agent's work as an observable tool timeline. SERP discovery runs first. Then each approved page is fetched through Bright Data Web Unlocker."

[Point to the policy_gate tool showing allowed vs blocked counts.]

"Before any fetch, the policy engine checks the domain against the allowlist and the budget. Approved domains pass. Anything outside policy gets blocked — you can see the allowed and blocked counts right here."

---

## 1:35 – 2:05 — Safety layer / risk

[Screen: click the "Risk" tab. Show the prompt-injection firewall card and any findings.]

"Here's the part most agents skip. WebSentry treats every fetched page as hostile content. It scans for hidden DOM, suspicious metadata, and direct model-control phrases like 'ignore previous instructions'."

[Point to a finding card with its severity badge and risk score.]

"When it finds adversarial text, it quarantines it and strips it before any evidence reaches the model — so the agent can't be hijacked by a web page."

---

## 2:05 – 2:30 — Business output / brief

[Screen: click the "Brief" tab. Show the headline, executive summary, and the signal groups.]

"Only sanitized, policy-approved evidence reaches AI/ML API, which generates the GTM intelligence brief: pricing signals, hiring signals, product direction, positioning, and recommended sales angles."

[Point to the "Source citations" panel on the right.]

"And every claim is backed by a real source citation. No uncited business advice."

---

## 2:30 – 2:45 — Audit + close

[Screen: click the "Audit" tab. Scroll the table showing step, product, status, ms, bytes, risk. Then click "Export JSON".]

"Every step is logged — discovery, policy checks, fetches, scans, latency, bytes, cost, and risk score — and the full run exports as audit JSON for compliance."

[Screen: back to the hero header.]

"The future isn't just AI agents with web access. It's governed agents with safe, auditable, budgeted, Bright Data-powered web access. That's WebSentry AI."

---

## Optional 10-second tech tag (if time allows)

"Built on Next.js 16, React 19, Bright Data SERP and Web Unlocker, and AI/ML API — and it ships judge-safe: with no keys it runs the exact same flow in deterministic demo mode."

---

## B-roll / cutaway suggestions

- Quick terminal shot: `npm run test` showing 9 passing tests, and `npm run build` succeeding (proves it's real, not a mockup).
- Slow zoom on the route map SVG in the hero (agent → Bright Data → citations, with the blocked node in red).
- Close-up of the budget guardrail progress bar filling as the run completes.

## Timing notes

- If you need a 60-second cut: keep Problem (0:00), one-click run (0:18), Risk tab (1:35), Brief + citations (2:05), Export JSON close.
- Speak to the on-screen numbers (Sources, Blocked, Spend, Risk hits). Real numbers sell it harder than claims.
