import { describe, expect, it } from "vitest";
import { evaluatePolicy, matchesDomain } from "./policy";
import type { Source } from "./types";

const source: Source = {
  id: "src_test",
  title: "Linear pricing",
  url: "https://linear.app/pricing",
  domain: "linear.app",
  kind: "pricing",
  snippet: "Pricing page",
  product: "Demo SERP",
  status: "discovered",
  latencyMs: 10,
  bytes: 100,
  costUsd: 0.05,
};

describe("policy engine", () => {
  it("matches direct and wildcard domains", () => {
    expect(matchesDomain("docs.brightdata.com", "*.brightdata.com")).toBe(true);
    expect(matchesDomain("brightdata.com", "*.brightdata.com")).toBe(true);
    expect(matchesDomain("evil.example", "*.brightdata.com")).toBe(false);
  });

  it("allows approved domains", () => {
    const decision = evaluatePolicy({
      source,
      allowedDomains: ["linear.app"],
      budgetUsedUsd: 0,
      budgetUsd: 1,
      riskTolerance: "balanced",
    });
    expect(decision.allowed).toBe(true);
  });

  it("blocks domains outside the allowlist", () => {
    const decision = evaluatePolicy({
      source: { ...source, url: "https://random-spam-site.example/path" },
      allowedDomains: ["linear.app"],
      budgetUsedUsd: 0,
      budgetUsd: 1,
      riskTolerance: "balanced",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.rule).toBe("allowlist");
  });

  it("blocks requests that would exceed the budget", () => {
    const decision = evaluatePolicy({
      source,
      allowedDomains: ["linear.app"],
      budgetUsedUsd: 0.98,
      budgetUsd: 1,
      riskTolerance: "balanced",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.rule).toBe("budget");
  });
});
