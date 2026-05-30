import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { AgentMsg } from "@/hooks/useChat";
import { postFeedback } from "@/lib/chat-api";

type Props = {
  msg: AgentMsg;
  onChange: (id: string, patch: Partial<AgentMsg["feedback"]>) => void;
};

export function FeedbackBar({ msg, onChange }: Props) {
  const status = msg.feedback.status;

  async function send(helpful: boolean) {
    if (status === "sending" || status === "sent") return;
    onChange(msg.id, { status: "sending", helpful });
    try {
      await postFeedback({
        request_id: msg.requestId,
        helpful,
        reason: helpful ? "resolved" : "not_resolved",
      });
      onChange(msg.id, { status: "sent", helpful });
    } catch {
      onChange(msg.id, { status: "error", helpful });
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Obrigado pelo feedback.
      </p>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
      <span>Essa resposta ajudou?</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => send(true)}
          disabled={status === "sending"}
          aria-label="Resposta ajudou"
          className="rounded-md border border-border bg-card/40 p-1.5 text-foreground/70 transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => send(false)}
          disabled={status === "sending"}
          aria-label="Resposta não ajudou"
          className="rounded-md border border-border bg-card/40 p-1.5 text-foreground/70 transition hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {status === "error" && (
        <span className="text-destructive/90">Não foi possível enviar o feedback.</span>
      )}
    </div>
  );
}
