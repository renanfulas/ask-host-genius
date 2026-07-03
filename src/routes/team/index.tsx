import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";

import { CaseFilters } from "@/components/team/CaseFilters";
import { CaseListItem } from "@/components/team/CaseListItem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionExpiredEffect } from "@/hooks/useStaffSession";
import { listSupportCases, type CasesQuery } from "@/lib/support-api";

const LIMIT = 25;

const searchSchema = z.object({
  view: z.enum(["active", "history"]).catch("active"),
  status: z.string().optional().catch(undefined),
  domain: z.string().optional().catch(undefined),
  color: z.enum(["green", "yellow", "red", "paused"]).optional().catch(undefined),
  sort: z.enum(["attention", "opened_at"]).catch("attention"),
  mine: z.boolean().optional().catch(undefined),
  offset: z.number().int().min(0).catch(0),
});

export type TeamQueueSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/team/")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Fila - Console do time" }] }),
  component: TeamQueuePage,
});

function TeamQueuePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const query: CasesQuery = {
    view: search.view,
    status: search.status,
    domain: search.domain,
    color: search.color,
    sort: search.view === "active" ? search.sort : undefined,
    assignee: search.mine ? "me" : undefined,
    limit: LIMIT,
    offset: search.offset,
  };

  const casesQuery = useQuery({
    queryKey: ["support", "cases", query],
    queryFn: () => listSupportCases(query),
    placeholderData: (prev) => prev,
  });

  useSessionExpiredEffect(casesQuery.error);

  function updateFilters(patch: Partial<TeamQueueSearch>) {
    void navigate({ search: (prev) => ({ ...prev, ...patch, offset: 0 }) });
  }

  function goToOffset(offset: number) {
    void navigate({ search: (prev) => ({ ...prev, offset }) });
  }

  const cases = casesQuery.data?.cases ?? [];
  const hasNextPage = cases.length === LIMIT;
  const hasPrevPage = search.offset > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-foreground">Fila de atendimento</h1>
        {casesQuery.data && (
          <span className="text-sm text-muted-foreground">
            {casesQuery.data.count} caso{casesQuery.data.count === 1 ? "" : "s"} nesta página
          </span>
        )}
      </div>

      <CaseFilters search={search} onChange={updateFilters} />

      {casesQuery.data?.truncated && (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fila parcialmente exibida</AlertTitle>
          <AlertDescription>
            O limite operacional de casos ativos foi atingido; alguns casos podem não aparecer aqui.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4 space-y-2">
        {casesQuery.isPending &&
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {casesQuery.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Não foi possível carregar a fila</AlertTitle>
            <AlertDescription>Tente novamente em instantes.</AlertDescription>
          </Alert>
        )}

        {casesQuery.isSuccess && cases.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Nenhum caso encontrado com esses filtros.
          </p>
        )}

        {cases.map((c) => (
          <CaseListItem key={c.case_id} data={c} />
        ))}
      </div>

      {(hasNextPage || hasPrevPage) && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage || casesQuery.isFetching}
            onClick={() => goToOffset(Math.max(0, search.offset - LIMIT))}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || casesQuery.isFetching}
            onClick={() => goToOffset(search.offset + LIMIT)}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
