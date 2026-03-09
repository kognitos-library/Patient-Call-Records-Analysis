import { NextResponse } from "next/server";
import { fetchAnalysisDetail } from "@/lib/analyses";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await fetchAnalysisDetail(id);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analysis-detail] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
