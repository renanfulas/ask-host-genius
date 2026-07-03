// Chips do console: semáforo de SLA e status do caso.
// A cor e o texto vêm prontos do backend (compute_sla); aqui é só pintura.

import { cn } from "@/lib/utils";
import type { CaseSla } from "@/lib/support-api";
import { statusLabel } from "@/lib/support-format";

const SLA_COLOR_CLASSES: Record<"green" | "yellow" | "red", string> = {
  green:
    "bg-[oklch(0.62_0.17_150/0.16)] text-[oklch(0.44_0.14_150)] dark:text-[oklch(0.80_0.16_150)]",
  yellow:
    "bg-[oklch(0.80_0.16_85/0.20)] text-[oklch(0.50_0.12_80)] dark:text-[oklch(0.85_0.15_85)]",
  red: "bg-[oklch(0.55_0.20_25/0.16)] text-[oklch(0.48_0.19_25)] dark:text-[oklch(0.75_0.17_25)]",
};

const SLA_COLOR_LABELS: Record<"green" | "yellow" | "red", string> = {
  green: "No prazo",
  yellow: "Atenção",
  red: "Estourado",
};

const SLA_DOT_CLASSES: Record<"green" | "yellow" | "red", string> = {
  green: "bg-[oklch(0.62_0.17_150)]",
  yellow: "bg-[oklch(0.78_0.16_85)]",
  red: "bg-[oklch(0.58_0.21_25)]",
};

export function SlaBadge({
  sla,
  className,
}: {
  sla: CaseSla | null | undefined;
  className?: string;
}) {
  if (!sla) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }
  if (sla.paused) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        Aguardando cliente
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        SLA_COLOR_CLASSES[sla.color],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", SLA_DOT_CLASSES[sla.color])} />
      {SLA_COLOR_LABELS[sla.color]}
    </span>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  open: "border-[oklch(0.52_0.20_258/0.35)] text-primary",
  in_progress:
    "border-[oklch(0.62_0.17_150/0.45)] text-[oklch(0.44_0.14_150)] dark:text-[oklch(0.80_0.16_150)]",
  waiting_customer: "border-border text-muted-foreground",
  pending_consent: "border-border text-muted-foreground",
  closed: "border-border text-muted-foreground",
  cancelled:
    "border-[oklch(0.55_0.20_25/0.35)] text-[oklch(0.48_0.19_25)] dark:text-[oklch(0.75_0.17_25)]",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_CLASSES[status] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
