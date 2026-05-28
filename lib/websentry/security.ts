import type { RiskFinding, Source } from "./types";

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|system|developer) instructions/i,
  /reveal (the )?(system prompt|api key|secret|credentials)/i,
  /send .*?(api key|token|secret|password)/i,
  /override .*?(safety|policy|instructions)/i,
  /do not tell (the )?user/i,
  /you are now/i,
];

const HIDDEN_DOM_PATTERNS = [
  /display\s*:\s*none/i,
  /visibility\s*:\s*hidden/i,
  /opacity\s*:\s*0/i,
  /font-size\s*:\s*0/i,
  /aria-hidden\s*=\s*["']true["']/i,
];

export function scanForPromptInjection(source: Source): RiskFinding[] {
  const text = source.content ?? `${source.title}\n${source.snippet}`;
  const findings: RiskFinding[] = [];

  for (const pattern of HIDDEN_DOM_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      findings.push({
        sourceId: source.id,
        url: source.url,
        severity: "medium",
        category: "hidden-dom",
        evidence: truncateEvidence(match[0]),
        action: "Strip hidden or non-rendered content before LLM summarization.",
        score: 58,
      });
      break;
    }
  }

  for (const pattern of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      findings.push({
        sourceId: source.id,
        url: source.url,
        severity: "high",
        category: "prompt-injection",
        evidence: truncateEvidence(match[0]),
        action: "Quarantine the suspicious instruction and cite only visible business facts.",
        score: 88,
      });
      break;
    }
  }

  if (/schema\.org|application\/ld\+json/i.test(text) && /instruction|assistant|model/i.test(text)) {
    findings.push({
      sourceId: source.id,
      url: source.url,
      severity: "medium",
      category: "metadata",
      evidence: "Structured metadata contains agent-like instruction language.",
      action: "Exclude metadata from model context unless explicitly whitelisted.",
      score: 62,
    });
  }

  return findings;
}

export function sanitizeForModel(content: string): string {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+display\s*:\s*none[^>]*>[\s\S]*?<\/[^>]+>/gi, "")
    .replace(/ignore (all )?(previous|prior|system|developer) instructions/gi, "[removed suspicious instruction]")
    .slice(0, 8000);
}

function truncateEvidence(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}
