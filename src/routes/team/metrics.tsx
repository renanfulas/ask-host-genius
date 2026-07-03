import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionExpiredEffect } from "@/hooks/useStaffSession";
import { getSupportMetrics } from "@/lib/support-api";
import { formatDurationSeconds, reasonLabel, statusLabel } from "@/lib/support-format";

const searchSchema = z.object({
  window: z.enum(["14d", "30d"]).catch("14d"),
  domain: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/team/metrics")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Métricas - Console do time" }] }),
  component: TeamMetricsPage,
});

const throughputConfig: ChartConfig = {
  opened: { label: "Abertos", color: "oklch(0.52 0.20 258)" },
  closed: { label: "Fechados", color: "oklch(0.62 0.17 150)" },
};

const BACKLOG_COLOR_DOTS: Record<string, string> = {
  green: "bg-[oklch(0.62_0.17_150)]",
  yellow: "bg-[oklch(0.78_0.16_85)]",
  red: "bg-[oklch(0.58_0.21_25)]",
  paused: "bg-muted-foreground/60",
};

const BACKLOG_COLOR_LABELS: Record<string, string> = {
  green: "No prazo",
  yellow: "Atenção",
  red: "Estourado",
  paused: "Aguardando cliente",
};

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="pt-0 text-xs text-muted-foreground">{description}</CardContent>
      )}
    </Card>
  );
}

function TeamMetricsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const metricsQuery = useQuery({
    queryKey: ["support", "metrics", search.window, search.domain],
    queryFn: () => getSupportMetrics(search.window, search.domain),
  });

  useSessionExpiredEffect(metricsQuery.error);

  if (metricsQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (metricsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar as métricas</AlertTitle>
          <AlertDescription>Tente novamente em instantes.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = metricsQuery.data;
  const maxReasonCount = Math.max(1, ...data.escalation_reasons.map((r) => r.count));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Métricas de atendimento
        </h1>
        <div className="flex items-end gap-3">
          <div className="w-40 space-y-1">
            <Label className="text-xs text-muted-foreground">Domínio</Label>
            <Input
              value={search.domain ?? ""}
              placeholder="Todos"
              onChange={(e) =>
                void navigate({
                  search: (prev) => ({ ...prev, domain: e.target.value || undefined }),
                })
              }
            />
          </div>
          <div className="w-32 space-y-1">
            <Label className="text-xs text-muted-foreground">Janela</Label>
            <Select
              value={search.window}
              onValueChange={(v) =>
                void navigate({ search: (prev) => ({ ...prev, window: v as "14d" | "30d" }) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14d">14 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {data.backlog.truncated && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Backlog parcialmente calculado</AlertTitle>
          <AlertDescription>
            O limite operacional de casos ativos foi atingido; os números de backlog podem estar
            subestimados.
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Backlog atual</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["green", "yellow", "red", "paused"] as const).map((color) => (
            <Card key={color}>
              <CardContent className="flex items-center gap-2 pt-6">
                <span className={`h-2.5 w-2.5 rounded-full ${BACKLOG_COLOR_DOTS[color]}`} />
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {data.backlog.by_color[color] ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{BACKLOG_COLOR_LABELS[color]}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {Object.keys(data.backlog.by_status).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(data.backlog.by_status).map(([status, count]) => (
              <span
                key={status}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {statusLabel(status)}: {count}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Volume diário</h2>
        <Card>
          <CardContent className="pt-6">
            <ChartContainer config={throughputConfig} className="aspect-auto h-64 w-full">
              <BarChart data={data.throughput} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v: string) => format(parseISO(v), "dd/MM")}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => format(parseISO(String(v)), "dd/MM/yyyy")}
                    />
                  }
                />
                <Bar dataKey="opened" fill="var(--color-opened)" radius={3} />
                <Bar dataKey="closed" fill="var(--color-closed)" radius={3} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Motivos de escalonamento</h2>
          <Card>
            <CardContent className="space-y-2 pt-6">
              {data.escalation_reasons.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem escalonamentos na janela.</p>
              )}
              {data.escalation_reasons.map((reason) => (
                <div key={reason.reason_code} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{reasonLabel(reason.reason_code)}</span>
                    <span className="font-medium text-muted-foreground">{reason.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(reason.count / maxReasonCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Feedback dos clientes</h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de utilidade</span>
                <span className="text-lg font-semibold text-foreground">
                  {data.feedback.helpful_rate != null
                    ? `${Math.round(data.feedback.helpful_rate * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Útil</span>
                <span className="font-medium text-foreground">{data.feedback.helpful}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Não útil</span>
                <span className="font-medium text-foreground">{data.feedback.not_helpful}</span>
              </div>
              {data.feedback.unknown_domain_count > 0 && (
                <p className="text-xs text-muted-foreground">
                  {data.feedback.unknown_domain_count} feedback(s) sem domínio identificado.
                </p>
              )}
              {data.feedback.sample_note && (
                <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {data.feedback.sample_note}
                </span>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Tempo de resposta</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            title="Mediana até a primeira ação"
            value={formatDurationSeconds(data.response_times.median_seconds_to_first_action)}
          />
          <StatCard
            title="Mediana até o encerramento"
            value={formatDurationSeconds(data.response_times.median_seconds_to_close)}
          />
        </div>
      </section>
    </div>
  );
}
