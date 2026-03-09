"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Title,
  Text,
  Badge,
  InsightsCard,
  Alert,
  AlertTitle,
  AlertDescription,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Button,
} from "@kognitos/lattice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnalysisSummary, DashboardMetrics } from "@/lib/types";

interface DashboardData {
  analyses: AnalysisSummary[];
  metrics: DashboardMetrics;
}

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "default" }> = {
  report_generated: { label: "Report Generated", variant: "success" },
  generating: { label: "Generating", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
  needs_review: { label: "Needs Review", variant: "warning" },
  queued: { label: "Queued", variant: "secondary" },
  stopped: { label: "Stopped", variant: "default" },
};

function buildActivityData(analyses: AnalysisSummary[]) {
  const grouped: Record<string, number> = {};
  for (const a of analyses) {
    const day = dayjs(a.createdAt).format("MMM D");
    grouped[day] = (grouped[day] || 0) + 1;
  }
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .reverse();
}

const chartConfig = {
  count: { label: "Analyses", color: "var(--chart-1)" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/analyses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analyses");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { analyses, metrics } = data;
  const activityData = buildActivityData(analyses);

  const filtered = filter
    ? analyses.filter((a) =>
        a.patientId.toLowerCase().includes(filter.toLowerCase())
      )
    : analyses;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Title level="h2">Patient Call Records</Title>
        <Text color="muted">Analysis dashboard — view patient reports and trends</Text>
      </div>

      {metrics.erAlertCount > 0 && (
        <Alert>
          <Icon type="CircleAlert" size="sm" />
          <AlertTitle>
            {metrics.erAlertCount} {metrics.erAlertCount === 1 ? "analysis" : "analyses"} flagged ER alerts
          </AlertTitle>
          <AlertDescription>
            Patients with recent ER sends may need immediate follow-up.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightsCard
          title="Total Analyses"
          value={String(metrics.total)}
          trend={{ value: "all time" }}
        />
        <InsightsCard
          title="Unique Patients"
          value={String(metrics.uniquePatients)}
          trend={{ value: `of ${metrics.total} runs` }}
        />
        <InsightsCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          variant="success"
          trend={{ value: "reports generated", type: "positive" }}
        />
        <InsightsCard
          title="This Month"
          value={String(metrics.analysesThisMonth)}
          trend={{ value: dayjs().format("MMMM YYYY") }}
        />
      </div>

      {activityData.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <Title level="h4" className="mb-4">
            Analysis Activity
          </Title>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={activityData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Title level="h4">Patient Analyses</Title>
          <input
            type="text"
            placeholder="Filter by patient ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-56"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon type="Search" size="xl" className="text-muted-foreground mb-3" />
            <Text color="muted">
              {filter ? "No analyses match that filter" : "No patient analyses yet"}
            </Text>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ER Alert</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Last Disposition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.queued;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.patientId}</TableCell>
                      <TableCell>{dayjs(a.createdAt).format("MMM D, h:mm A")}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {a.hasErAlert ? (
                          <Badge variant="destructive">ER Alert</Badge>
                        ) : (
                          <Text level="xSmall" color="muted">—</Text>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.lastContactDays !== null ? (
                          <Text level="small">{a.lastContactDays}d ago</Text>
                        ) : (
                          <Text level="xSmall" color="muted">—</Text>
                        )}
                      </TableCell>
                      <TableCell>{a.callsFound}</TableCell>
                      <TableCell>
                        <Text level="small">{a.lastDisposition ?? "—"}</Text>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-xs" asChild>
                            <Link href={`/analyses/${a.id}`}>
                              <Icon type="FileText" size="xs" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon-xs" asChild>
                            <a href={a.kognitosUrl} target="_blank" rel="noopener noreferrer">
                              <Icon type="ExternalLink" size="xs" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
