// Barra de filtros da fila. Só monta a query — a ordenação e o cálculo do
// semáforo continuam no backend.

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { caseStatusValues } from "@/lib/support-api";
import { statusLabel } from "@/lib/support-format";
import type { TeamQueueSearch } from "@/routes/team/index";

const ALL = "all";

export function CaseFilters({
  search,
  onChange,
}: {
  search: TeamQueueSearch;
  onChange: (patch: Partial<TeamQueueSearch>) => void;
}) {
  const isActive = search.view === "active";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <Tabs
        value={search.view}
        onValueChange={(view) => onChange({ view: view as "active" | "history" })}
      >
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40 space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={search.status ?? ALL}
            onValueChange={(v) => onChange({ status: v === ALL ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {caseStatusValues.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-44 space-y-1">
          <Label className="text-xs text-muted-foreground">Domínio</Label>
          <Input
            value={search.domain ?? ""}
            onChange={(e) => onChange({ domain: e.target.value || undefined })}
            placeholder="suporte-vps-whatsapp"
          />
        </div>

        {isActive && (
          <div className="w-40 space-y-1">
            <Label className="text-xs text-muted-foreground">Semáforo</Label>
            <Select
              value={search.color ?? ALL}
              onValueChange={(v) =>
                onChange({ color: v === ALL ? undefined : (v as TeamQueueSearch["color"]) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as cores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                <SelectItem value="green">No prazo</SelectItem>
                <SelectItem value="yellow">Atenção</SelectItem>
                <SelectItem value="red">Estourado</SelectItem>
                <SelectItem value="paused">Aguardando cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isActive && (
          <div className="w-44 space-y-1">
            <Label className="text-xs text-muted-foreground">Ordenar por</Label>
            <Select
              value={search.sort}
              onValueChange={(v) => onChange({ sort: v as TeamQueueSearch["sort"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attention">Atenção</SelectItem>
                <SelectItem value="opened_at">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2 pb-1.5">
          <Checkbox
            id="mine"
            checked={!!search.mine}
            onCheckedChange={(checked) => onChange({ mine: checked === true ? true : undefined })}
          />
          <Label htmlFor="mine" className="cursor-pointer text-sm font-normal">
            Meus casos
          </Label>
        </div>
      </div>
    </div>
  );
}
