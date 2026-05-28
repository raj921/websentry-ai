export type RiskTolerance = "strict" | "balanced" | "open";

export type InvestigationRequest = {
  targetCompany: string;
  competitors: string[];
  focusAreas: string[];
  allowedDomains: string[];
  budgetUsd: number;
  riskTolerance: RiskTolerance;
};

export type Source = {
  id: string;
  title: string;
  url: string;
  domain: string;
  kind: "pricing" | "careers" | "blog" | "search" | "news" | "trap" | "other";
  snippet: string;
  product: "SERP API" | "Web Unlocker" | "Scraping Browser" | "MCP Server" | "Demo SERP" | "Demo Unlocker";
  status: "discovered" | "fetched" | "blocked" | "failed";
  latencyMs: number;
  bytes: number;
  costUsd: number;
  content?: string;
};

export type PolicyDecision = {
  sourceId: string;
  url: string;
  domain: string;
  allowed: boolean;
  reason: string;
  rule: "allowlist" | "denylist" | "budget" | "rate-limit" | "risk";
};

export type RiskFinding = {
  sourceId: string;
  url: string;
  severity: "low" | "medium" | "high";
  category: "hidden-dom" | "prompt-injection" | "metadata" | "exfiltration" | "benign";
  evidence: string;
  action: string;
  score: number;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  step: "input" | "discover" | "policy" | "fetch" | "scan" | "summarize" | "export";
  product: string;
  url?: string;
  status: "ok" | "blocked" | "warning" | "failed";
  message: string;
  latencyMs: number;
  bytes: number;
  costUsd: number;
  riskScore: number;
};

export type Brief = {
  headline: string;
  executiveSummary: string;
  pricingSignals: string[];
  hiringSignals: string[];
  positioningSignals: string[];
  productSignals: string[];
  recommendedSalesAngles: string[];
  citations: { label: string; url: string }[];
};

export type InvestigationResponse = {
  runId: string;
  mode: "demo" | "bright-data" | "openrouter-demo" | "bright-data-openrouter";
  brief: Brief;
  sources: Source[];
  auditEvents: AuditEvent[];
  policyDecisions: PolicyDecision[];
  riskFindings: RiskFinding[];
  spend: {
    budgetUsd: number;
    estimatedUsd: number;
    remainingUsd: number;
  };
  productsUsed: string[];
};
