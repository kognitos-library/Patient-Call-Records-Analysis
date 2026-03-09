import { req, ORG_ID, WORKSPACE_ID, AUTOMATION_ID, kognitosRunUrl } from "./kognitos";
import type {
  RawRun,
  RunState,
  AnalysisStatus,
  AnalysisSummary,
  AnalysisDetail,
  DashboardMetrics,
} from "./types";
import dayjs from "dayjs";

function extractRunId(name: string): string {
  return name.split("/").pop() ?? name;
}

function runStateKey(run: RawRun): RunState {
  const s = run.state;
  if (s.completed) return "completed";
  if (s.executing) return "executing";
  if (s.awaiting_guidance) return "awaiting_guidance";
  if (s.failed) return "failed";
  if (s.pending) return "pending";
  if (s.stopped) return "stopped";
  return "pending";
}

function toAnalysisStatus(state: RunState): AnalysisStatus {
  switch (state) {
    case "completed":
      return "report_generated";
    case "executing":
      return "generating";
    case "failed":
      return "error";
    case "awaiting_guidance":
      return "needs_review";
    case "pending":
      return "queued";
    case "stopped":
      return "stopped";
  }
}

// --- Report parsing helpers ---

function parseErAlert(report: string): boolean {
  return report.includes("IMMEDIATE ATTENTION");
}

function parseLastContactDays(report: string): number | null {
  const m = report.match(/\*\*Last Contact:\*\*\s*(\d+)\s*days? ago/);
  return m ? parseInt(m[1], 10) : null;
}

function parseCallsFound(report: string): number {
  const section = report.split("CALL HISTORY DETAILS")[1] ?? "";
  const matches = section.match(/###\s+\*\*/g);
  return matches ? matches.length : 0;
}

function parseQuickRefField(report: string, label: string): string | null {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|?\\s*$`, "m");
  const m = report.match(re);
  if (!m) return null;
  const val = m[1].trim();
  return val === "None mentioned" || val === "N/A" || val === "None scheduled" ? null : val;
}

function parseFollowUpItems(report: string): string[] {
  const section = report.split("FOLLOW-UP NEEDED")[1] ?? "";
  const items: string[] = [];
  const re = /[✅•]\s*\*\*(.+?)\*\*/g;
  let match;
  while ((match = re.exec(section)) !== null) {
    items.push(match[1]);
  }
  return items;
}

function parseReport(report: string | null | undefined) {
  if (!report) {
    return {
      hasErAlert: false,
      lastContactDays: null,
      callsFound: 0,
      activeMedications: null,
      lastDisposition: null,
      followUpItems: [] as string[],
    };
  }
  return {
    hasErAlert: parseErAlert(report),
    lastContactDays: parseLastContactDays(report),
    callsFound: parseCallsFound(report),
    activeMedications: parseQuickRefField(report, "Active Medications"),
    lastDisposition: parseQuickRefField(report, "Last Disposition"),
    followUpItems: parseFollowUpItems(report),
  };
}

function rawRunToSummary(run: RawRun): AnalysisSummary {
  const id = extractRunId(run.name);
  const state = runStateKey(run);
  const status = toAnalysisStatus(state);
  const patientId = run.user_inputs?.patient_id?.text ?? "Unknown";
  const report = run.state.completed?.outputs?.patient_report?.text ?? null;
  const parsed = parseReport(report);

  return {
    id,
    patientId,
    status,
    createdAt: run.create_time,
    kognitosUrl: kognitosRunUrl(id),
    ...parsed,
  };
}

export async function fetchAllAnalyses(): Promise<{
  analyses: AnalysisSummary[];
  metrics: DashboardMetrics;
}> {
  const path = `/organizations/${ORG_ID}/workspaces/${WORKSPACE_ID}/automations/${AUTOMATION_ID}/runs?pageSize=50`;
  const res = await req(path);
  if (!res.ok) throw new Error(`Kognitos API error: ${res.status}`);
  const data = await res.json();
  const runs: RawRun[] = data.runs ?? [];

  const analyses = runs.map(rawRunToSummary);

  const uniquePatients = new Set(analyses.map((a) => a.patientId)).size;
  const completed = analyses.filter((a) => a.status === "report_generated").length;
  const startOfMonth = dayjs().startOf("month");
  const thisMonth = analyses.filter((a) => dayjs(a.createdAt).isAfter(startOfMonth)).length;
  const erAlertCount = analyses.filter((a) => a.hasErAlert).length;

  const metrics: DashboardMetrics = {
    total: analyses.length,
    uniquePatients,
    successRate: analyses.length > 0 ? Math.round((completed / analyses.length) * 100) : 0,
    analysesThisMonth: thisMonth,
    erAlertCount,
  };

  return { analyses, metrics };
}

export async function fetchAnalysisDetail(runId: string): Promise<AnalysisDetail> {
  const path = `/organizations/${ORG_ID}/workspaces/${WORKSPACE_ID}/automations/${AUTOMATION_ID}/runs/${runId}`;
  const res = await req(path);
  if (!res.ok) throw new Error(`Kognitos API error: ${res.status}`);
  const run: RawRun = await res.json();

  const summary = rawRunToSummary(run);
  const reportMarkdown = run.state.completed?.outputs?.patient_report?.text ?? null;

  return { ...summary, reportMarkdown };
}
