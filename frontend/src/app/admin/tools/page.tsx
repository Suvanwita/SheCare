"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  Server,
  Settings2,
  Sparkles,
  Stethoscope,
  XCircle,
} from "lucide-react";
import type { AdminToolAction } from "../../../services/adminTools.service";
import { useAdminToolsStore } from "../../../store/adminToolsStore";

interface ToolDefinition {
  action: AdminToolAction;
  title: string;
  description: string;
  icon: LucideIcon;
  warning?: string;
}

const tools: ToolDefinition[] = [
  {
    action: "seed-doctors",
    title: "Seed Doctors",
    description:
      "Load the curated doctor starter set into MongoDB for admin and public doctor flows.",
    icon: Stethoscope,
    warning:
      "This replaces matching sample doctors by name before inserting fresh seed records.",
  },
  {
    action: "seed-articles",
    title: "Seed Articles",
    description:
      "Load Knowledge Hub starter articles and rebuild backend autocomplete suggestions.",
    icon: FileText,
    warning:
      "This replaces matching sample articles by slug before inserting fresh seed records.",
  },
  {
    action: "export-articles-csv",
    title: "Export Article CSV",
    description:
      "Write published articles to ml-model/article-service/data/articles.csv for training.",
    icon: Download,
  },
  {
    action: "refresh-article-trie",
    title: "Refresh Article Trie",
    description:
      "Rebuild backend Knowledge Hub autocomplete suggestions from published articles.",
    icon: Search,
  },
  {
    action: "retrain-article-recommender",
    title: "Retrain Recommender",
    description:
      "Ask article-service to retrain if its retrain endpoint is available.",
    icon: Sparkles,
  },
];

const formatResultDetails = (data: Record<string, unknown> | undefined) => {
  if (!data) {
    return null;
  }

  const details = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${String(value)}`);

  return details.length ? details.join(" · ") : null;
};

function StatusPill({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        ok
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export default function AdminToolsPage() {
  const status = useAdminToolsStore((state) => state.status);
  const lastResults = useAdminToolsStore((state) => state.lastResults);
  const loadingStatus = useAdminToolsStore((state) => state.loadingStatus);
  const loadingTool = useAdminToolsStore((state) => state.loadingTool);
  const error = useAdminToolsStore((state) => state.error);
  const fetchStatus = useAdminToolsStore((state) => state.fetchStatus);
  const runTool = useAdminToolsStore((state) => state.runTool);
  const [pendingTool, setPendingTool] = useState<ToolDefinition | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRun = (tool: ToolDefinition) => {
    if (tool.warning) {
      setPendingTool(tool);
      return;
    }

    runTool(tool.action);
  };

  const confirmPendingTool = () => {
    if (!pendingTool) {
      return;
    }

    runTool(pendingTool.action);
    setPendingTool(null);
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Admin Module
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                Tools
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Maintenance actions for seeded data, Knowledge Hub search, article
                recommender training data, and service health checks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh Status
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.3fr]">
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-foreground">System Status</h2>
              <p className="text-sm text-muted-foreground">
                Backend connectivity and configured ML services.
              </p>
            </div>
          </div>

          {loadingStatus && !status ? (
            <div className="mt-5 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
              Loading status...
            </div>
          ) : status ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-muted-foreground">MongoDB</p>
                    <StatusPill
                      ok={status.mongodb.status === "connected"}
                      label={status.mongodb.status}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Database: {status.mongodb.database || "not connected"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/70 p-4">
                  <p className="text-sm font-bold text-muted-foreground">Article Service</p>
                  <div className="mt-2">
                    <StatusPill
                      ok={status.articleServiceHealth.reachable}
                      label={status.articleServiceHealth.reachable ? "reachable" : "offline"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card/70 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <p className="text-sm font-bold">Articles</p>
                  </div>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {status.counts.articleCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/70 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    <p className="text-sm font-bold">Doctors</p>
                  </div>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {status.counts.doctorCount}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card/70 p-4">
                <p className="text-sm font-bold text-foreground">Configured URLs</p>
                <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <dt className="font-bold">ARTICLE_ML_SERVICE_URL</dt>
                    <dd className="break-all">{status.services.articleMlServiceUrl}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-bold">PCOS_ML_SERVICE_URL</dt>
                    <dd className="break-all">{status.services.pcosMlServiceUrl || "not set"}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-bold">CYCLE_ML_SERVICE_URL</dt>
                    <dd className="break-all">{status.services.cycleMlServiceUrl || "not set"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
              Status has not been loaded yet.
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const result = lastResults[tool.action];
            const isLoading = loadingTool === tool.action;
            const resultDetails = formatResultDetails(result?.data);

            return (
              <article key={tool.action} className="glass-card rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-black text-foreground">{tool.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {tool.warning ? (
                  <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{tool.warning}</span>
                  </div>
                ) : null}

                {result ? (
                  <div className="mt-4 rounded-lg border border-border bg-card/70 p-3">
                    <div className="flex items-start gap-2 text-sm">
                      {result.success ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <div>
                        <p className="font-bold text-foreground">{result.message}</p>
                        {resultDetails ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {resultDetails}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">
                    No recent run in this session.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleRun(tool)}
                  disabled={Boolean(loadingTool)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                  {isLoading ? "Running..." : "Run Tool"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {pendingTool ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Confirm {pendingTool.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pendingTool.warning}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingTool(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingTool}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Run Anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
