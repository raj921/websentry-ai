import { buildDemoSources } from "./demo-data";
import { domainFromUrl } from "./policy";
import type { InvestigationRequest, Source } from "./types";

const BRIGHT_DATA_ENDPOINT = "https://api.brightdata.com/request";

export function hasBrightDataSerpConfig() {
  return Boolean(process.env.BRIGHT_DATA_API_KEY && process.env.BRIGHT_DATA_SERP_ZONE);
}

export function hasBrightDataUnlockerConfig() {
  return Boolean(process.env.BRIGHT_DATA_API_KEY && process.env.BRIGHT_DATA_UNLOCKER_ZONE);
}

export async function discoverSources(request: InvestigationRequest): Promise<{
  sources: Source[];
  usedBrightData: boolean;
  error?: string;
}> {
  if (!hasBrightDataSerpConfig()) {
    return { sources: buildDemoSources(request), usedBrightData: false };
  }

  try {
    const query = encodeURIComponent(
      `${request.targetCompany} ${request.competitors.join(" ")} pricing careers changelog AI product launch`,
    );
    const response = await fetch(BRIGHT_DATA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: process.env.BRIGHT_DATA_SERP_ZONE,
        url: `https://www.google.com/search?q=${query}&hl=en&gl=us`,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`SERP API returned ${response.status}`);
    }

    const data = (await response.json()) as {
      organic?: { link?: string; title?: string; description?: string }[];
    };
    const organic = Array.isArray(data.organic) ? data.organic : [];
    const sources = organic
      .filter((item) => item.link && item.title)
      .slice(0, 8)
      .map((item, index): Source => {
        const url = item.link ?? "";
        return {
          id: `src_${index + 1}`,
          title: item.title ?? "Untitled result",
          url,
          domain: domainFromUrl(url),
          kind: inferKind(`${item.title} ${item.description} ${url}`),
          snippet: item.description ?? "Bright Data SERP result.",
          product: "SERP API",
          status: "discovered",
          latencyMs: 320 + index * 25,
          bytes: JSON.stringify(item).length,
          costUsd: 0.01,
        };
      });

    return {
      sources: sources.length > 0 ? sources : buildDemoSources(request),
      usedBrightData: sources.length > 0,
    };
  } catch (error) {
    return {
      sources: buildDemoSources(request),
      usedBrightData: false,
      error: error instanceof Error ? error.message : "Unknown Bright Data SERP failure",
    };
  }
}

export async function fetchSourceContent(source: Source): Promise<{
  source: Source;
  usedBrightData: boolean;
  error?: string;
}> {
  if (!hasBrightDataUnlockerConfig()) {
    return {
      source: {
        ...source,
        status: "fetched",
        product: source.product === "SERP API" ? "Demo Unlocker" : source.product,
        content: source.content ?? `${source.title}\n${source.snippet}`,
      },
      usedBrightData: false,
    };
  }

  try {
    const response = await fetch(BRIGHT_DATA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: process.env.BRIGHT_DATA_UNLOCKER_ZONE,
        url: source.url,
        format: "raw",
        data_format: "markdown",
      }),
    });

    if (!response.ok) {
      throw new Error(`Web Unlocker returned ${response.status}`);
    }

    const text = await response.text();
    return {
      source: {
        ...source,
        status: "fetched",
        product: "Web Unlocker",
        content: text.slice(0, 12000),
        bytes: text.length,
      },
      usedBrightData: true,
    };
  } catch (error) {
    return {
      source: {
        ...source,
        status: "failed",
        content: source.content ?? source.snippet,
      },
      usedBrightData: false,
      error: error instanceof Error ? error.message : "Unknown Bright Data Unlocker failure",
    };
  }
}

function inferKind(value: string): Source["kind"] {
  const text = value.toLowerCase();
  if (text.includes("pricing")) return "pricing";
  if (text.includes("career") || text.includes("job")) return "careers";
  if (text.includes("blog") || text.includes("changelog") || text.includes("release")) return "blog";
  if (text.includes("news")) return "news";
  return "search";
}
