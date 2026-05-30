import { AlertCircle, Sparkles } from "lucide-react";
import type { Msg, AgentMsg } from "@/hooks/useChat";
import { EscalationCard } from "./EscalationCard";
import { ReferencesChips } from "./ReferencesChips";
import { SupportCode } from "./SupportCode";
import { FeedbackBar } from "./FeedbackBar";

type Props = {
  msg: Msg;
  onFeedback: (id: string, patch: Partial<AgentMsg["feedback"]>) => void;
};

export function MessageBubble({ msg, onFeedback }: Props) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-accent/60 px-4 py-3 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
        </div>
        <div className="text-sm text-foreground/80">{msg.text}</div>
      </div>
    );
  }

  // agent
  const friendlyError = msg.errorCode
    ? "Houve um problema processando essa pergunta. Tente reformular ou consulte o suporte humano."
    : null;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/95">
          <p className="whitespace-pre-wrap">{friendlyError ?? msg.answer}</p>
        </div>

        {msg.escalated && <EscalationCard reasons={msg.handoffReasons} />}
        <ReferencesChips refs={msg.references} />
        <SupportCode code={msg.supportCode} />
        <FeedbackBar msg={msg} onChange={onFeedback} />
      </div>
    </div>
  );
}
