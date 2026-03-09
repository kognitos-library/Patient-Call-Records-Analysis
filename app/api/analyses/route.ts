import { NextResponse } from "next/server";
import { fetchAllAnalyses } from "@/lib/analyses";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllAnalyses();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analyses] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
