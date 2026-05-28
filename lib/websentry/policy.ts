import type { PolicyDecision, RiskTolerance, Source } from "./types";

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function companyToDomain(company: string): string {
  return `${company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;
}

export function normalizeDomains(domains: string[]): string[] {
  return Array.from(
    new Set(
      domains
        .map((domain) => domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, ""))
        .filter(Boolean),
    ),
  );
}

export function matchesDomain(domain: string, rule: string): boolean {
  const normalizedRule = rule.toLowerCase().replace(/^www\./, "");
  if (normalizedRule.startsWith("*.")) {
    const suffix = normalizedRule.slice(2);
    return domain === suffix || domain.endsWith(`.${suffix}`);
  }
  return domain === normalizedRule || domain.endsWith(`.${normalizedRule}`);
}

export function deriveDefaultAllowedDomains(targetCompany: string, competitors: string[]) {
  const curated: Record<string, string> = {
    linear: "linear.app",
    asana: "asana.com",
    clickup: "clickup.com",
    jira: "atlassian.com",
    atlassian: "atlassian.com",
    vercel: "vercel.com",
    netlify: "netlify.com",
    cloudflare: "cloudflare.com",
  };

  return normalizeDomains(
    [targetCompany, ...competitors].map((company) => {
      const key = company.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return curated[key] ?? companyToDomain(company);
    }),
  );
}

export function evaluatePolicy(params: {
  source: Source;
  allowedDomains: string[];
  budgetUsedUsd: number;
  budgetUsd: number;
  riskTolerance: RiskTolerance;
}): PolicyDecision {
  const domain = domainFromUrl(params.source.url);
  const allowedDomains = normalizeDomains(params.allowedDomains);
  const isAllowedDomain = allowedDomains.some((rule) => matchesDomain(domain, rule));

  if (!domain) {
    return {
      sourceId: params.source.id,
      url: params.source.url,
      domain,
      allowed: false,
      reason: "URL is invalid and cannot be safely routed.",
      rule: "denylist",
    };
  }

  if (!isAllowedDomain) {
    return {
      sourceId: params.source.id,
      url: params.source.url,
      domain,
      allowed: false,
      reason: `${domain} is outside the approved domain policy.`,
      rule: "allowlist",
    };
  }

  if (params.budgetUsedUsd + params.source.costUsd > params.budgetUsd) {
    return {
      sourceId: params.source.id,
      url: params.source.url,
      domain,
      allowed: false,
      reason: "Estimated request would exceed the run budget.",
      rule: "budget",
    };
  }

  if (params.riskTolerance === "strict" && params.source.kind === "trap") {
    return {
      sourceId: params.source.id,
      url: params.source.url,
      domain,
      allowed: false,
      reason: "Strict mode blocks known trap fixtures before fetch.",
      rule: "risk",
    };
  }

  return {
    sourceId: params.source.id,
    url: params.source.url,
    domain,
    allowed: true,
    reason: `${domain} matches the allowlist and fits the budget.`,
    rule: "allowlist",
  };
}
