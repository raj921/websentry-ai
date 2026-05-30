"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import type { UIMessage } from "ai";
import {
  AlertTriangle,
  ClipboardCheck,
  Download,
  Gauge,
  Globe2,
  KeyRound,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  WalletCards,
  XCircle,
} from "lucide-react";
import { AgentChat } from "@/components/agent-elements/agent-chat";
import { McpTool } from "@/components/agent-elements/tools/mcp-tool";
import { SearchTool } from "@/components/agent-elements/tools/search-tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { InvestigationResponse, RiskTolerance } from "@/lib/websentry/types";

const focusOptions = ["pricing", "hiring", "product launches", "positioning", "AI messaging"];

const initialPayload = {
  targetCompany: "Linear",
  competitors: "Asana, ClickUp",
  allowedDomains: "linear.app, asana.com, clickup.com",
  budgetUsd: 2,
  riskTolerance: "balanced" as RiskTolerance,
  focusAreas: focusOptions.slice(0, 4),
};

export function WebSentryDashboard() {
  const [targetCompany, setTargetCompany] = useState(initialPayload.targetCompany);
  const [competitors, setCompetitors] = useState(initialPayload.competitors);
  const [allowedDomains, setAllowedDomains] = useState(initialPayload.allowedDomains);
  const [budgetUsd, setBudgetUsd] = useState(initialPayload.budgetUsd);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(initialPayload.riskTolerance);
  const [focusAreas, setFocusAreas] = useState<string[]>(initialPayload.focusAreas);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void runInvestigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockedCount = result?.policyDecisions.filter((decision) => !decision.allowed).length ?? 0;
  const highRiskCount = result?.riskFindings.filter((finding) => finding.severity === "high").length ?? 0;
  const fetchedCount = result?.sources.filter((source) => source.status === "fetched").length ?? 0;
  const spendPercent = result ? Math.min(100, (result.spend.estimatedUsd / result.spend.budgetUsd) * 100) : 0;

  const agentMessages = useMemo<UIMessage[]>(() => {
    const summary =
      result?.brief.executiveSummary ??
      "Ready to run governed Bright Data discovery with policy checks, prompt-injection defense, and citations.";
    return [
      {
        id: "assistant-summary",
        role: "assistant",
        parts: [{ type: "text", text: summary }],
      },
    ] as UIMessage[];
  }, [result]);

  async function runInvestigation() {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCompany,
          competitors: splitCsv(competitors),
          focusAreas,
          allowedDomains: splitCsv(allowedDomains),
          budgetUsd,
          riskTolerance,
        }),
      });
      if (!response.ok) throw new Error(`Investigation failed with ${response.status}`);
      setResult((await response.json()) as InvestigationResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown failure");
    } finally {
      setIsRunning(false);
    }
  }

  function toggleFocus(value: string) {
    setFocusAreas((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function exportAudit() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.runId}-websentry-audit.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8f1] text-[#151712]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(21,23,18,0.06)_1px,transparent_1px),linear-gradient(rgba(21,23,18,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-[#20241b] bg-[#151712] p-5 text-[#f7f7ef] shadow-[8px_8px_0_#d98c24]">
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <Badge className="rounded-[4px] border-[#80b76b] bg-[#243322] text-[#c8f0b4]">Web Data UNLOCKED</Badge>
              <Badge className="rounded-[4px] border-[#d98c24] bg-[#332717] text-[#ffd08c]">Bright Data control plane</Badge>
              <Badge className="rounded-[4px] border-[#82a7ff] bg-[#17223d] text-[#cbd8ff]">AI/ML API primary</Badge>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-[#80b76b]">
                  Enterprise agent gateway
                </p>
                <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-normal sm:text-6xl">
                  WebSentry AI
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#d7ddcf]">
                  Govern live-web AI agents before they browse: discovery, policy, budget, prompt-injection defense,
                  citations, and audit trails in one judge-ready dashboard.
                </p>
              </div>
              <div className="grid place-items-center border border-[#5b604f] bg-[#20241b] p-3">
                <RouteMap blocked={blockedCount} fetched={fetchedCount} risk={highRiskCount} />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <Metric icon={Globe2} label="Sources" value={String(result?.sources.length ?? "--")} tone="green" />
            <Metric icon={XCircle} label="Blocked" value={String(blockedCount)} tone="red" />
            <Metric icon={WalletCards} label="Spend" value={result ? `$${result.spend.estimatedUsd}` : "$--"} tone="amber" />
            <Metric icon={AlertTriangle} label="Risk hits" value={String(result?.riskFindings.length ?? 0)} tone="blue" />
          </section>
        </header>

        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <Card className="rounded-[8px] border-[#20241b] bg-white/95 p-4 shadow-[4px_4px_0_#20241b]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#51614a]">Investigation input</p>
                  <h2 className="text-xl font-black">Run control</h2>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#d9decf] bg-white text-[#151712]"
                    aria-label="API key status"
                  >
                    <KeyRound className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Works without keys in demo mode. Add Bright Data and AI/ML API env vars for live calls.
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3">
                <Field label="Target company">
                  <Input value={targetCompany} onChange={(event) => setTargetCompany(event.target.value)} />
                </Field>
                <Field label="Competitors">
                  <Textarea
                    value={competitors}
                    onChange={(event) => setCompetitors(event.target.value)}
                    className="min-h-20"
                  />
                </Field>
                <Field label="Allowed domains">
                  <Textarea
                    value={allowedDomains}
                    onChange={(event) => setAllowedDomains(event.target.value)}
                    className="min-h-20"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Budget USD">
                    <Input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={budgetUsd}
                      onChange={(event) => setBudgetUsd(Number(event.target.value))}
                    />
                  </Field>
                  <Field label="Risk mode">
                    <Select value={riskTolerance} onValueChange={(value) => setRiskTolerance(value as RiskTolerance)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">Focus areas</p>
                  <div className="grid grid-cols-1 gap-2">
                    {focusOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 rounded-[6px] border border-[#d9decf] bg-[#fbfcf6] px-3 py-2 text-sm"
                      >
                        <Checkbox checked={focusAreas.includes(option)} onCheckedChange={() => toggleFocus(option)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={runInvestigation}
                  disabled={isRunning}
                  className="h-11 w-full rounded-[6px] bg-[#151712] text-[#f7f7ef] hover:bg-[#2a2d23]"
                >
                  {isRunning ? <Radar className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Running governed agent" : "Run WebSentry demo"}
                </Button>
                {error && <p className="rounded-[6px] bg-[#fff0ec] p-3 text-sm text-[#9b2c1f]">{error}</p>}
              </div>
            </Card>

            <Card className="rounded-[8px] border-[#20241b] bg-[#151712] p-4 text-[#f7f7ef]">
              <div className="mb-3 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#d98c24]" />
                <h2 className="font-bold">Budget guardrail</h2>
              </div>
              <Progress value={spendPercent} className="h-2" />
              <div className="mt-3 flex justify-between font-mono text-xs text-[#d7ddcf]">
                <span>${result?.spend.estimatedUsd ?? 0} used</span>
                <span>${result?.spend.remainingUsd ?? budgetUsd} left</span>
              </div>
              <Separator className="my-4 bg-[#4c5144]" />
              <div className="space-y-2 text-sm text-[#d7ddcf]">
                {(result?.productsUsed ?? ["Demo SERP", "Demo Unlocker", "Deterministic Brief Generator"]).map((product) => (
                  <div key={product} className="flex items-center justify-between gap-3">
                    <span>{product}</span>
                    <Badge className="rounded-[4px] bg-[#243322] text-[#c8f0b4]">active</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <section className="space-y-4">
            <Tabs defaultValue="brief" className="w-full">
              <div className="flex flex-col gap-3 border border-[#20241b] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="grid h-auto grid-cols-4 rounded-[8px] bg-[#eef1e6] p-1">
                  <TabsTrigger value="brief" className="rounded-[6px]">Brief</TabsTrigger>
                  <TabsTrigger value="agent" className="rounded-[6px]">Agent</TabsTrigger>
                  <TabsTrigger value="risk" className="rounded-[6px]">Risk</TabsTrigger>
                  <TabsTrigger value="audit" className="rounded-[6px]">Audit</TabsTrigger>
                </TabsList>
                <Button onClick={exportAudit} disabled={!result} variant="outline" className="rounded-[6px]">
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>

              <TabsContent value="brief" className="mt-4">
                <BriefPanel result={result} />
              </TabsContent>

              <TabsContent value="agent" className="mt-4">
                <AgentPanel result={result} messages={agentMessages} isRunning={isRunning} />
              </TabsContent>

              <TabsContent value="risk" className="mt-4">
                <RiskPanel result={result} />
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <AuditPanel result={result} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "green" | "red" | "amber" | "blue";
}) {
  const color = {
    green: "text-[#2f6b4f] bg-[#dcefd7]",
    red: "text-[#9b2c1f] bg-[#ffe2d8]",
    amber: "text-[#8a520e] bg-[#ffe4b4]",
    blue: "text-[#244f8d] bg-[#d8e6ff]",
  }[tone];
  return (
    <Card className="rounded-[8px] border-[#20241b] bg-white p-4 shadow-[4px_4px_0_#20241b]">
      <div className={`mb-5 inline-flex h-9 w-9 items-center justify-center rounded-[6px] ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#64705b]">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </Card>
  );
}

function BriefPanel({ result }: { result: InvestigationResponse | null }) {
  if (!result) return <LoadingPanel label="Waiting for first investigation..." />;
  const groups = [
    ["Pricing", result.brief.pricingSignals],
    ["Hiring", result.brief.hiringSignals],
    ["Positioning", result.brief.positioningSignals],
    ["Product", result.brief.productSignals],
    ["Sales angles", result.brief.recommendedSalesAngles],
  ] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
      <Card className="rounded-[8px] border-[#20241b] bg-white p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] bg-[#151712] text-[#f7f7ef]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#51614a]">{result.mode}</p>
            <h2 className="text-3xl font-black tracking-normal">{result.brief.headline}</h2>
          </div>
        </div>
        <p className="max-w-4xl text-lg leading-8 text-[#3e4438]">{result.brief.executiveSummary}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {groups.map(([label, items]) => (
            <div key={label} className="rounded-[8px] border border-[#d9decf] bg-[#fbfcf6] p-4">
              <h3 className="mb-3 font-bold">{label}</h3>
              <ul className="space-y-2 text-sm leading-6 text-[#3e4438]">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-[#2f6b4f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
      <Card className="rounded-[8px] border-[#20241b] bg-[#151712] p-4 text-[#f7f7ef]">
        <h3 className="mb-3 font-bold">Source citations</h3>
        <ScrollArea className="h-[480px] pr-3">
          <div className="space-y-3">
            {result.brief.citations.map((citation, index) => (
              <a
                key={`${citation.url}-${index}`}
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[8px] border border-[#4c5144] bg-[#20241b] p-3 text-sm hover:border-[#d98c24]"
              >
                <span className="font-mono text-xs text-[#d98c24]">SRC {index + 1}</span>
                <span className="mt-1 block font-semibold">{citation.label}</span>
                <span className="mt-1 block truncate text-[#aeb6a5]">{citation.url}</span>
              </a>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function AgentPanel({
  result,
  messages,
  isRunning,
}: {
  result: InvestigationResponse | null;
  messages: UIMessage[];
  isRunning: boolean;
}) {
  const firstSource = result?.sources.find((source) => source.status === "fetched");
  const mcpInfo = {
    serverName: "bright_data",
    toolName: "scrape_as_markdown",
    displayName: "Scrape As Markdown",
    category: "scrape",
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <Card className="rounded-[8px] border-[#20241b] bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <TerminalSquare className="h-5 w-5 text-[#2f6b4f]" />
          <h2 className="text-xl font-black">21st.dev agent tool timeline</h2>
        </div>
        <div className="space-y-3">
          <SearchTool
            defaultOpen
            part={{
              id: "serp",
              toolCallId: "serp",
              type: "tool-WebSearch",
              state: result ? "output-available" : "input-streaming",
              input: { query: "pricing careers changelog AI product launch" },
              output: {
                results: (result?.sources ?? []).slice(0, 5).map((source) => ({
                  source: "web",
                  title: source.title,
                  date: source.domain,
                })),
              },
            }}
          />
          <McpTool
            defaultOpen
            mcpInfo={mcpInfo}
            chatStatus={isRunning ? "streaming" : "ready"}
            part={{
              id: "unlocker",
              type: "tool-mcp__bright_data__scrape_as_markdown",
              state: result ? "output-available" : "input-streaming",
              input: { url: firstSource?.url ?? "https://linear.app/pricing" },
              output: {
                product: result?.productsUsed.includes("Bright Data Web Unlocker")
                  ? "Bright Data Web Unlocker"
                  : "Demo Unlocker",
                policy: "allowed",
                citations: result?.brief.citations.slice(0, 3) ?? [],
              },
            }}
          />
          <McpTool
            mcpInfo={{
              serverName: "websentry",
              toolName: "policy_gate",
              displayName: "Check Policy",
              category: "security",
            }}
            chatStatus="ready"
            part={{
              id: "policy",
              type: "tool-mcp__websentry__policy_gate",
              state: "output-available",
              input: { allowed_domains: "linear.app, asana.com, clickup.com" },
              output: {
                allowed: result?.policyDecisions.filter((decision) => decision.allowed).length ?? 0,
                blocked: result?.policyDecisions.filter((decision) => !decision.allowed).length ?? 0,
              },
            }}
          />
        </div>
      </Card>
      <Card className="h-[560px] rounded-[8px] border-[#20241b] bg-white p-0">
        <AgentChat
          messages={messages}
          status={isRunning ? "streaming" : "ready"}
          onSend={() => {}}
          onStop={() => {}}
          initialScrollBehavior="top"
          className="h-full"
          classNames={{ inputBar: "border-t bg-[#fbfcf6]" }}
          suggestions={[
            { id: "linear-demo", label: "Run Linear demo", value: "Analyze Linear, Asana, and ClickUp." },
            { id: "show-risk", label: "Show risk", value: "Explain prompt-injection findings." },
          ]}
        />
      </Card>
    </div>
  );
}

function RiskPanel({ result }: { result: InvestigationResponse | null }) {
  if (!result) return <LoadingPanel label="Risk scanner waiting for sources..." />;
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="rounded-[8px] border-[#20241b] bg-[#151712] p-5 text-[#f7f7ef]">
        <ShieldCheck className="mb-5 h-10 w-10 text-[#80b76b]" />
        <h2 className="text-2xl font-black">Prompt-injection firewall</h2>
        <p className="mt-3 leading-7 text-[#d7ddcf]">
          Web content is treated as hostile. Hidden DOM, suspicious metadata, and direct model-control phrases are
          quarantined before evidence reaches the AI/ML API model.
        </p>
        <div className="mt-6 space-y-3">
          <RiskStat label="High severity" value={String(result.riskFindings.filter((item) => item.severity === "high").length)} />
          <RiskStat label="Blocked URLs" value={String(result.policyDecisions.filter((item) => !item.allowed).length)} />
          <RiskStat label="Sanitized citations" value={String(result.brief.citations.length)} />
        </div>
      </Card>
      <div className="space-y-3">
        {result.riskFindings.length === 0 ? (
          <Card className="rounded-[8px] border-[#20241b] bg-white p-5">No adversarial web content found in this run.</Card>
        ) : (
          result.riskFindings.map((finding) => (
            <Card key={`${finding.sourceId}-${finding.category}`} className="rounded-[8px] border-[#20241b] bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-[4px] bg-[#9b2c1f] text-white">{finding.severity}</Badge>
                <Badge variant="outline" className="rounded-[4px]">{finding.category}</Badge>
                <span className="font-mono text-xs text-[#64705b]">risk {finding.score}/100</span>
              </div>
              <p className="mt-3 font-semibold">{finding.evidence}</p>
              <p className="mt-2 text-sm leading-6 text-[#4d5447]">{finding.action}</p>
              <p className="mt-2 truncate font-mono text-xs text-[#64705b]">{finding.url}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AuditPanel({ result }: { result: InvestigationResponse | null }) {
  if (!result) return <LoadingPanel label="Audit trail waiting for run..." />;
  return (
    <Card className="rounded-[8px] border-[#20241b] bg-white">
      <ScrollArea className="h-[650px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">ms</TableHead>
              <TableHead className="text-right">bytes</TableHead>
              <TableHead className="text-right">risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.auditEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-mono text-xs uppercase">{event.step}</TableCell>
                <TableCell>{event.product}</TableCell>
                <TableCell>
                  <Badge className={`rounded-[4px] ${statusClass(event.status)}`}>{event.status}</Badge>
                </TableCell>
                <TableCell className="max-w-[520px]">{event.message}</TableCell>
                <TableCell className="text-right font-mono">{event.latencyMs}</TableCell>
                <TableCell className="text-right font-mono">{event.bytes}</TableCell>
                <TableCell className="text-right font-mono">{event.riskScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

function RiskStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-[#4c5144] bg-[#20241b] px-3 py-2">
      <span className="text-sm text-[#d7ddcf]">{label}</span>
      <span className="font-mono text-lg text-[#ffd08c]">{value}</span>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <Card className="rounded-[8px] border-[#20241b] bg-white p-8">
      <div className="flex items-center gap-3">
        <Radar className="h-5 w-5 animate-spin text-[#2f6b4f]" />
        <span>{label}</span>
      </div>
    </Card>
  );
}

function RouteMap({ blocked, fetched, risk }: { blocked: number; fetched: number; risk: number }) {
  return (
    <svg viewBox="0 0 220 170" className="h-full w-full" role="img" aria-label="Agent route map">
      <rect x="8" y="8" width="204" height="154" fill="#151712" stroke="#5b604f" />
      <path d="M35 120 C65 45, 135 44, 181 35" fill="none" stroke="#80b76b" strokeWidth="3" />
      <path d="M35 120 C82 150, 128 142, 188 122" fill="none" stroke="#d98c24" strokeWidth="3" strokeDasharray="6 6" />
      <circle cx="35" cy="120" r="13" fill="#d98c24" />
      <circle cx="112" cy="58" r="11" fill="#80b76b" />
      <circle cx="181" cy="35" r="13" fill="#82a7ff" />
      <circle cx="188" cy="122" r="13" fill="#e15b45" />
      <text x="22" y="151" fill="#d7ddcf" fontSize="10">agent</text>
      <text x="83" y="32" fill="#d7ddcf" fontSize="10">Bright Data</text>
      <text x="147" y="22" fill="#d7ddcf" fontSize="10">citations {fetched}</text>
      <text x="137" y="151" fill="#d7ddcf" fontSize="10">blocked {blocked}</text>
      <text x="78" y="94" fill="#ffd08c" fontSize="10">risk {risk}</text>
    </svg>
  );
}

function statusClass(status: string) {
  if (status === "ok") return "bg-[#dcefd7] text-[#2f6b4f]";
  if (status === "blocked" || status === "failed") return "bg-[#ffe2d8] text-[#9b2c1f]";
  return "bg-[#ffe4b4] text-[#8a520e]";
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
