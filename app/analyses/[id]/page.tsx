"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Title,
  Text,
  Badge,
  Button,
  Icon,
  Skeleton,
  Alert,
  AlertTitle,
  AlertDescription,
  Markdown,
} from "@kognitos/lattice";
import type { AnalysisDetail } from "@/lib/types";

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyses/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analysis");
        return res.json();
      })
      .then(setAnalysis)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error loading analysis</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href="/">
            <Icon type="ArrowLeft" size="sm" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/">
              <Icon type="ArrowLeft" size="sm" />
              Dashboard
            </Link>
          </Button>
          <Title level="h2">Patient {analysis.patientId}</Title>
          <Text color="muted">
            Analysis from {dayjs(analysis.createdAt).format("MMMM D, YYYY [at] h:mm A")}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {analysis.hasErAlert && (
            <Badge variant="destructive">ER Alert</Badge>
          )}
          <Badge variant="success">Report Generated</Badge>
          <Button variant="outline" size="sm" asChild>
            <a
              href={analysis.kognitosUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon type="ExternalLink" size="xs" />
              View in Kognitos
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border p-3">
          <Text level="xSmall" color="muted">Last Contact</Text>
          <Text weight="semibold">
            {analysis.lastContactDays !== null
              ? `${analysis.lastContactDays} days ago`
              : "N/A"}
          </Text>
        </div>
        <div className="rounded-lg border border-border p-3">
          <Text level="xSmall" color="muted">Calls Found</Text>
          <Text weight="semibold">{analysis.callsFound}</Text>
        </div>
        <div className="rounded-lg border border-border p-3">
          <Text level="xSmall" color="muted">Medications</Text>
          <Text weight="semibold">{analysis.activeMedications ?? "None"}</Text>
        </div>
        <div className="rounded-lg border border-border p-3">
          <Text level="xSmall" color="muted">Last Disposition</Text>
          <Text weight="semibold">{analysis.lastDisposition ?? "N/A"}</Text>
        </div>
      </div>

      {analysis.followUpItems.length > 0 && (
        <Alert>
          <Icon type="Bell" size="sm" />
          <AlertTitle>Follow-Up Items</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {analysis.followUpItems.map((item, i) => (
                <li key={i}>
                  <Text level="small" className="inline">{item}</Text>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {analysis.reportMarkdown ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <Markdown>{analysis.reportMarkdown}</Markdown>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon type="FileX" size="xl" className="text-muted-foreground mb-3" />
          <Text color="muted">No report available for this analysis</Text>
        </div>
      )}
    </div>
  );
}
