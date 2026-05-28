# WebSentry AI

WebSentry AI is a Bright Data-powered control plane for safe live-web AI agents. It demonstrates how enterprise agents can discover public web sources, enforce domain and budget policy, fetch through Bright Data, scan for prompt injection, and produce citation-backed GTM intelligence.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind v4
- shadcn/ui
- 21st.dev Agent Elements
- Bright Data SERP API and Web Unlocker API
- OpenRouter primary LLM path, defaulting to `google/gemini-2.5-flash`
- Vitest unit tests

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app works without secrets in deterministic demo mode. Add real keys to enable live calls:

```bash
cp .env.example .env.local
```

Required for OpenRouter:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-2.5-flash
```

Required for Bright Data:

```bash
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_SERP_ZONE=serp_api1
BRIGHT_DATA_UNLOCKER_ZONE=unlocker
```

## Demo Flow

Default scenario:

- Target: Linear
- Competitors: Asana, ClickUp
- Focus: pricing, hiring, product launches, positioning
- Allowed domains: `linear.app`, `asana.com`, `clickup.com`
- Budget: `$2.00`

The dashboard shows:

- Bright Data SERP discovery
- Web Unlocker fetches
- policy allow/block decisions
- prompt-injection findings
- spend and remaining budget
- citation-backed GTM intelligence brief
- exportable audit JSON

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Bright Data Notes

SERP API and Web Unlocker API both use:

```txt
https://api.brightdata.com/request
```

WebSentry uses live Bright Data only when the required env vars exist. Otherwise it stays judge-safe with deterministic demo data and labels the mode clearly.
