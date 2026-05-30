import { LifeBuoy } from "lucide-react";

export function EscalationCard({ reasons }: { reasons: string[] }) {
  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/[0.06] p-3">
      <div className="flex items-start gap-2.5">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Este caso pode precisar de suporte humano.
          </p>
          <p className="text-xs text-muted-foreground">
            Guarde o código de suporte abaixo para continuidade.
          </p>
          {reasons.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              {reasons.map((r) => (
                <li key={r}>— {r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
