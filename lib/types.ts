export type RunState =
  | "completed"
  | "awaiting_guidance"
  | "failed"
  | "executing"
  | "pending"
  | "stopped";

export interface RunOutput {
  text?: string;
  table?: { inline?: { data?: string } };
}

export interface RawRun {
  name: string;
  create_time: string;
  update_time?: string;
  state: {
    completed?: {
      outputs?: Record<string, RunOutput>;
      update_time?: string;
    };
    awaiting_guidance?: {
      exception?: string;
      description?: string;
    };
    failed?: {
      error?: string;
      description?: string;
    };
    executing?: Record<string, unknown>;
    pending?: Record<string, unknown>;
    stopped?: Record<string, unknown>;
  };
  user_inputs?: Record<string, { text?: string }>;
  invocation_details?: {
    invocation_source?: string;
    user_id?: string;
  };
}

export type AnalysisStatus =
  | "report_generated"
  | "generating"
  | "error"
  | "needs_review"
  | "queued"
  | "stopped";

export interface AnalysisSummary {
  id: string;
  patientId: string;
  status: AnalysisStatus;
  createdAt: string;
  hasErAlert: boolean;
  lastContactDays: number | null;
  callsFound: number;
  activeMedications: string | null;
  lastDisposition: string | null;
  followUpItems: string[];
  kognitosUrl: string;
}

export interface AnalysisDetail extends AnalysisSummary {
  reportMarkdown: string | null;
}

export interface DashboardMetrics {
  total: number;
  uniquePatients: number;
  successRate: number;
  analysesThisMonth: number;
  erAlertCount: number;
}
