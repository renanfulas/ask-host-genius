import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TransitionAction } from "@/lib/support-api";
import { actionLabel } from "@/lib/support-format";
import { Loader2 } from "lucide-react";

const NOTE_MAX = 1000;

const ACTION_DESCRIPTIONS: Record<TransitionAction, string> = {
  claim: "Você assume este caso e ele deixa de ficar disponível para outros operadores.",
  release: "O caso volta para a fila sem dono.",
  wait_customer: "O SLA pausa até que o cliente responda.",
  resume: "O SLA volta a contar normalmente.",
  close: "O caso é encerrado e sai da fila ativa.",
  cancel: "O caso é cancelado e sai da fila ativa. Esta ação não notifica o cliente.",
};

const DESTRUCTIVE_ACTIONS = new Set<TransitionAction>(["cancel", "close"]);

export function TransitionDialog({
  action,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  action: TransitionAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note?: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionLabel(action)}</DialogTitle>
          <DialogDescription>{ACTION_DESCRIPTIONS[action]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="transition-note">Nota (opcional)</Label>
          <Textarea
            id="transition-note"
            value={note}
            maxLength={NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contexto para o histórico do caso…"
            rows={3}
          />
          <p className="text-right text-xs text-muted-foreground">
            {note.length}/{NOTE_MAX}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Voltar
          </Button>
          <Button
            variant={DESTRUCTIVE_ACTIONS.has(action) ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => onConfirm(note.trim() || undefined)}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
