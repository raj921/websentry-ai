import { NextResponse } from "next/server";
import { runInvestigation } from "@/lib/websentry/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runInvestigation(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to run investigation",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
