import { discoverSources, fetchSourceContent } from "./bright-data";
import { deriveDefaultAllowedDomains, evaluatePolicy, normalizeDomains } from "./policy";
import { buildBrief } from "./openrouter";
import { sanitizeForModel, scanForPromptInjection } from "./security";
import type {
  AuditEvent,
  InvestigationRequest,
  InvestigationResponse,
  PolicyDecision,
  RiskFinding,
  Source,
} from "./types";

export function normalizeRequest(input: Partial<InvestigationRequest>): InvestigationRequest {
  const targetCompany = stringOrDefault(input.targetCompany, "Linear");
  const competitors = arrayOrDefault(input.competitors, ["Asana", "ClickUp"]);
  const focusAreas = arrayOrDefault(input.focusAreas, ["pricing", "hiring", "product launches", "positioning"]);
  const allowedDomains = normalizeDomains(
    input.allowedDomains && input.allowedDomains.length > 0
      ? input.allowedDomains
      : deriveDefaultAllowedDomains(targetCompany, competitors),
  );

  return {
    targetCompany,
    competitors,
    focusAreas,
    allowedDomains,
    budgetUsd: typeof input.budgetUsd === "number" && input.budgetUsd > 0 ? input.budgetUsd : 2,
    riskTolerance: input.riskTolerance ?? "balanced",
  };
}

export async function runInvestigation(input: Partial<InvestigationRequest>): Promise<InvestigationResponse> {
  const request = normalizeRequest(input);
  const runId = `ws_${crypto.randomUUID()}`;
  const auditEvents: AuditEvent[] = [
    audit({
      step: "input",
      product: "WebSentry Policy Engine",
      status: "ok",
      message: `Run created for ${request.targetCompany} against ${request.competitors.join(", ")}.`,
    }),
  ];

  const discovery = await discoverSources(request);
  const sources = discovery.sources;
  const productsUsed = new Set<string>([discovery.usedBrightData ? "Bright Data SERP API" : "Demo SERP"]);
  auditEvents.push(
    audit({
      step: "discover",
      product: discovery.usedBrightData ? "Bright Data SERP API" : "Demo SERP",
      status: discovery.error ? "warning" : "ok",
      message: discovery.error
        ? `SERP discovery used demo fallback: ${discovery.error}`
        : `Discovered ${sources.length} public web sources.`,
      latencyMs: sum(sources.map((source) => source.latencyMs)),
      bytes: sum(sources.map((source) => source.bytes)),
      costUsd: discovery.usedBrightData ? 0.04 : 0,
    }),
  );

  let spendUsd = 0;
  const policyDecisions: PolicyDecision[] = [];
  const fetchedSources: Source[] = [];
  const riskFindings: RiskFinding[] = [];

  for (const source of sources) {
    const decision = evaluatePolicy({
      source,
      allowedDomains: request.allowedDomains,
      budgetUsedUsd: spendUsd,
      budgetUsd: request.budgetUsd,
      riskTolerance: request.riskTolerance,
    });
    policyDecisions.push(decision);
    auditEvents.push(
      audit({
        step: "policy",
        product: "Policy Engine",
        url: source.url,
        status: decision.allowed ? "ok" : "blocked",
        message: decision.reason,
        latencyMs: 7,
        costUsd: 0,
      }),
    );

    if (!decision.allowed) {
      fetchedSources.push({ ...source, status: "blocked" });
      continue;
    }

    const fetched = await fetchSourceContent(source);
    productsUsed.add(fetched.usedBrightData ? "Bright Data Web Unlocker" : "Demo Unlocker");
    spendUsd += fetched.source.costUsd;
    fetchedSources.push(fetched.source);
    auditEvents.push(
      audit({
        step: "fetch",
        product: fetched.usedBrightData ? "Bright Data Web Unlocker" : "Demo Unlocker",
        url: fetched.source.url,
        status: fetched.error ? "warning" : "ok",
        message: fetched.error
          ? `Fetch used cached/demo content after failure: ${fetched.error}`
          : `Fetched ${fetched.source.domain} through governed access.`,
        latencyMs: fetched.source.latencyMs,
        bytes: fetched.source.bytes,
        costUsd: fetched.usedBrightData ? fetched.source.costUsd : 0,
      }),
    );

    const findings = scanForPromptInjection(fetched.source);
    riskFindings.push(...findings);
    auditEvents.push(
      audit({
        step: "scan",
        product: "Prompt Injection Firewall",
        url: fetched.source.url,
        status: findings.some((finding) => finding.severity === "high") ? "warning" : "ok",
        message:
          findings.length > 0
            ? `Detected ${findings.length} adversarial content signal(s); unsafe text quarantined.`
            : "No adversarial instructions found.",
        latencyMs: 14,
        bytes: fetched.source.content?.length ?? 0,
        riskScore: Math.max(0, ...findings.map((finding) => finding.score)),
      }),
    );
  }

  const safeSources = fetchedSources.filter((source) => source.status === "fetched");
  const citations = safeSources.slice(0, 7).map((source) => ({ label: source.title, url: source.url }));
  const sanitizedEvidence = safeSources
    .map((source) => `SOURCE: ${source.title}\nURL: ${source.url}\n${sanitizeForModel(source.content ?? source.snippet)}`)
    .join("\n\n---\n\n")
    .slice(0, 20000);

  const briefResult = await buildBrief({
    request,
    sources: safeSources,
    citations,
    sanitizedEvidence,
  });
  productsUsed.add(briefResult.usedOpenRouter ? "OpenRouter" : "Deterministic Brief Generator");
  auditEvents.push(
    audit({
      step: "summarize",
      product: briefResult.usedOpenRouter ? `OpenRouter ${process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash"}` : "Deterministic Brief Generator",
      status: briefResult.error ? "warning" : "ok",
      message: briefResult.error
        ? `OpenRouter fallback used: ${briefResult.error}`
        : "Generated citation-backed GTM intelligence brief.",
      latencyMs: briefResult.usedOpenRouter ? 900 : 42,
      bytes: sanitizedEvidence.length,
      costUsd: briefResult.usedOpenRouter ? 0.01 : 0,
      riskScore: Math.max(0, ...riskFindings.map((finding) => finding.score)),
    }),
  );

  const brightDataMode = productsUsed.has("Bright Data SERP API") || productsUsed.has("Bright Data Web Unlocker");
  return {
    runId,
    mode: brightDataMode && briefResult.usedOpenRouter ? "bright-data-openrouter" : brightDataMode ? "bright-data" : briefResult.usedOpenRouter ? "openrouter-demo" : "demo",
    brief: briefResult.brief,
    sources: fetchedSources,
    auditEvents,
    policyDecisions,
    riskFindings,
    spend: {
      budgetUsd: request.budgetUsd,
      estimatedUsd: Number(spendUsd.toFixed(3)),
      remainingUsd: Number(Math.max(0, request.budgetUsd - spendUsd).toFixed(3)),
    },
    productsUsed: Array.from(productsUsed),
  };
}

function audit(input: Partial<AuditEvent> & Pick<AuditEvent, "step" | "product" | "status" | "message">): AuditEvent {
  return {
    id: `evt_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    url: input.url,
    step: input.step,
    product: input.product,
    status: input.status,
    message: input.message,
    latencyMs: input.latencyMs ?? 0,
    bytes: input.bytes ?? 0,
    costUsd: input.costUsd ?? 0,
    riskScore: input.riskScore ?? 0,
  };
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function arrayOrDefault(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
