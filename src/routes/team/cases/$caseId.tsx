import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SlaBadge, StatusBadge } from "@/components/team/badges";
import { TransitionDialog } from "@/components/team/TransitionDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionExpiredEffect } from "@/hooks/useStaffSession";
import {
  getSupportCase,
  SupportApiError,
  transitionSupportCase,
  type TransitionAction,
} from "@/lib/support-api";
import {
  actionLabel,
  allowedActionsForStatus,
  formatDateTime,
  formatRelative,
  priorityLabel,
  reasonLabel,
  statusLabel,
} from "@/lib/support-format";

export const Route = createFileRoute("/team/cases/$caseId")({
  head: () => ({ meta: [{ title: "Caso - Console do time" }] }),
  component: CaseDetailPage,
});

function errorMessage(error: unknown): string {
  if (error instanceof SupportApiError) {
    switch (error.kind) {
      case "not_found":
        return "Caso não encontrado.";
      case "storage":
        return "Banco de dados indisponível. Tente novamente em instantes.";
      case "network":
        return "Falha de rede. Verifique a conexão.";
      default:
        return "Não foi possível carregar este caso.";
    }
  }
  return "Não foi possível carregar este caso.";
}

function CaseDetailPage() {
  const { caseId } = Route.useParams();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<TransitionAction | null>(null);

  const detailQuery = useQuery({
    queryKey: ["support", "case", caseId],
    queryFn: () => getSupportCase(caseId),
  });

  useSessionExpiredEffect(detailQuery.error);

  const transition = useMutation({
    mutationFn: (input: { action: TransitionAction; note?: string }) =>
      transitionSupportCase(caseId, input.action, input.note),
    onSuccess: (data) => {
      toast.success(`Caso atualizado para "${statusLabel(data.status)}".`);
      setPendingAction(null);
      void queryClient.invalidateQueries({ queryKey: ["support", "case", caseId] });
      void queryClient.invalidateQueries({ queryKey: ["support", "cases"] });
    },
    onError: (error) => {
      if (error instanceof SupportApiError && error.kind === "conflict") {
        toast.error(
          error.options.conflictStatus
            ? `Este caso já está em outro estado: "${statusLabel(error.options.conflictStatus)}". Atualizando a tela…`
            : "Este caso mudou de estado. Atualizando a tela…",
        );
        setPendingAction(null);
        void queryClient.invalidateQueries({ queryKey: ["support", "case", caseId] });
      } else {
        toast.error(errorMessage(error));
      }
    },
  });

  if (detailQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/team"
          search={{ view: "active", sort: "attention", offset: 0 }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à fila
        </Link>
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{errorMessage(detailQuery.error)}</AlertTitle>
        </Alert>
      </div>
    );
  }

  const data = detailQuery.data;
  const allowedActions = allowedActionsForStatus(data.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Link
        to="/team"
        search={{ view: "active", sort: "attention", offset: 0 }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar à fila
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          <SlaBadge sla={data.sla} />
          {data.priority && (
            <span className="text-xs font-medium text-muted-foreground">
              {priorityLabel(data.priority)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">· {data.domain}</span>
        </div>
        <h1 className="font-display text-lg font-semibold text-foreground">
          {data.summary ?? "Caso de suporte"}
        </h1>
        <p className="text-xs text-muted-foreground">
          Aberto {formatRelative(data.opened_at)} · {formatDateTime(data.opened_at)}
        </p>
        {data.sla?.explanation && (
          <p className="text-sm text-muted-foreground">{data.sla.explanation}</p>
        )}
        {data.assignee && (
          <p className="inline-flex items-center gap-1 text-sm text-foreground">
            <UserRound className="h-4 w-4" /> Dono: {data.assignee.display_name}
          </p>
        )}
      </div>

      {allowedActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allowedActions.map((action) => (
            <Button
              key={action}
              size="sm"
              variant={action === "cancel" || action === "close" ? "outline" : "default"}
              onClick={() => setPendingAction(action)}
            >
              {actionLabel(action)}
            </Button>
          ))}
        </div>
      )}

      {data.customer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contato autorizado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {data.customer.display_label && (
              <p className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                {data.customer.display_label}
              </p>
            )}
            {data.customer.email && (
              <p className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {data.customer.email}
              </p>
            )}
            {data.customer.phone_last4 && (
              <p className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                final {data.customer.phone_last4}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {data.references.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Referências consultadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {data.references.map((ref) => (
                <li key={ref} className="break-all">
                  {ref}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.reason_codes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.reason_codes.map((code) => (
            <span
              key={code}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {reasonLabel(code)}
            </span>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Conversa</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[480px] space-y-3 overflow-y-auto">
          {data.transcript.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem mensagens registradas.</p>
          )}
          {data.transcript.map((turn) => (
            <div
              key={turn.sequence}
              className={
                turn.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-primary/10 px-3 py-2"
                  : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
              }
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">{turn.content}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>{turn.role === "user" ? "Cliente" : "Agente"}</span>
                {turn.created_at && <span>{formatDateTime(turn.created_at)}</span>}
                {turn.error_code && (
                  <span className="text-destructive">Erro: {turn.error_code}</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Histórico de eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {data.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma transição registrada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {data.events.map((event, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium text-foreground">{actionLabel(event.action)}</span>{" "}
                  <span className="text-muted-foreground">
                    ({statusLabel(event.from_status)} → {statusLabel(event.to_status)})
                  </span>{" "}
                  {event.actor_display_name && (
                    <span className="text-muted-foreground">por {event.actor_display_name}</span>
                  )}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDateTime(event.created_at)}
                  </span>
                  {event.note && <p className="mt-0.5 text-muted-foreground">"{event.note}"</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {pendingAction && (
        <TransitionDialog
          action={pendingAction}
          open={pendingAction !== null}
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          isPending={transition.isPending}
          onConfirm={(note) => transition.mutate({ action: pendingAction, note })}
        />
      )}
    </div>
  );
}
