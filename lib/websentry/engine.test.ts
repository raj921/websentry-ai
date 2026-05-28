import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInvestigation } from "./engine";
import { buildBrief } from "./openrouter";
import { buildDemoSources } from "./demo-data";
import type { InvestigationRequest } from "./types";

const request: InvestigationRequest = {
  targetCompany: "Linear",
  competitors: ["Asana", "ClickUp"],
  focusAreas: ["pricing", "hiring", "product launches"],
  allowedDomains: ["linear.app", "asana.com", "clickup.com"],
  budgetUsd: 2,
  riskTolerance: "balanced",
};

const originalEnv = { ...process.env };

describe("investigation engine", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.BRIGHT_DATA_API_KEY;
    delete process.env.BRIGHT_DATA_SERP_ZONE;
    delete process.env.BRIGHT_DATA_UNLOCKER_ZONE;
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("returns deterministic demo mode without API keys", async () => {
    const result = await runInvestigation(request);

    expect(result.mode).toBe("demo");
    expect(result.productsUsed).toContain("Demo SERP");
    expect(result.productsUsed).toContain("Demo Unlocker");
    expect(result.auditEvents.length).toBeGreaterThan(4);
    expect(result.brief.citations.length).toBeGreaterThan(0);
  });

  it("populates blocked policy decisions and risk findings in demo mode", async () => {
    const result = await runInvestigation(request);

    expect(result.policyDecisions.some((decision) => !decision.allowed)).toBe(true);
    expect(result.riskFindings.some((finding) => finding.category === "prompt-injection")).toBe(true);
  });

  it("falls back when OpenRouter is configured but fails", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );

    const sources = buildDemoSources(request);
    const result = await buildBrief({
      request,
      sources,
      citations: sources.slice(0, 2).map((source) => ({ label: source.title, url: source.url })),
      sanitizedEvidence: "safe evidence",
    });

    expect(result.usedOpenRouter).toBe(false);
    expect(result.error).toContain("OpenRouter returned 500");
    expect(result.brief.headline).toContain("Linear");
  });
});
