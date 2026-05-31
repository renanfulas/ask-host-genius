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
        <div className="max-w-[85%] rounded-2xl rounded-tr-md border border-primary/15 bg-primary/[0.12] px-4 py-3 text-sm leading-relaxed text-foreground shadow-[0_16px_50px_-42px_rgba(0,0,0,0.9)]">
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-foreground/85">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border border-border/55 bg-card/35 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
            {msg.answer}
          </p>
        </div>

        {msg.escalated && <EscalationCard reasons={msg.handoffReasons} />}
        <ReferencesChips refs={msg.references} />
        <SupportCode code={msg.supportCode} errorCode={msg.errorCode} />
        <FeedbackBar msg={msg} onChange={onFeedback} />
      </div>
    </div>
  );
}
