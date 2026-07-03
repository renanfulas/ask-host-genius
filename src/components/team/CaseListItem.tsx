import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { SlaBadge, StatusBadge } from "@/components/team/badges";
import type { CaseSummary } from "@/lib/support-api";
import { formatRelative, priorityLabel, reasonLabel } from "@/lib/support-format";

export function CaseListItem({ data }: { data: CaseSummary }) {
  return (
    <Link
      to="/team/cases/$caseId"
      params={{ caseId: data.case_id }}
      className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
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

          {data.summary && (
            <p className="truncate text-sm text-foreground" title={data.summary}>
              {data.summary}
            </p>
          )}

          {data.sla?.explanation && (
            <p className="text-xs text-muted-foreground">{data.sla.explanation}</p>
          )}

          {data.reason_codes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.reason_codes.map((code) => (
                <span
                  key={code}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {reasonLabel(code)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <span className="text-xs text-muted-foreground">{formatRelative(data.opened_at)}</span>
          {data.assignee ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <UserRound className="h-3 w-3" />
              {data.assignee.display_name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sem dono</span>
          )}
        </div>
      </div>
    </Link>
  );
}
