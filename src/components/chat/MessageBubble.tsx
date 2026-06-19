import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import type { Msg, AgentMsg, ErrorMsg } from "@/hooks/useChat";
import { EscalationCard } from "./EscalationCard";
import { ReferencesChips } from "./ReferencesChips";
import { SupportCode } from "./SupportCode";
import { FeedbackBar } from "./FeedbackBar";
import { LogoMark } from "@/components/brand/Logo";

type Props = {
  msg: Msg;
  onFeedback: (id: string, patch: Partial<AgentMsg["feedback"]>) => void;
};

const ERROR_META: Record<
  ErrorMsg["kind"],
  { icon: typeof AlertCircle; title: string; tone: string }
> = {
  network: { icon: AlertCircle, title: "Sem conexão com o agente", tone: "destructive" },
  rate_limit: { icon: Clock, title: "Muitas requisições", tone: "accent" },
  server: { icon: AlertCircle, title: "Erro no servidor", tone: "destructive" },
  validation: { icon: AlertTriangle, title: "Mensagem inválida", tone: "accent" },
};

export function MessageBubble({ msg, onFeedback }: Props) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    const meta = ERROR_META[msg.kind];
    const Icon = meta.icon;
    const isDestructive = meta.tone === "destructive";
    return (
      <div
        role="alert"
        className={
          "flex items-start gap-3 rounded-2xl border px-4 py-3 " +
          (isDestructive
            ? "border-destructive/35 bg-destructive/10 text-foreground"
            : "border-[oklch(0.86_0.17_90)]/55 bg-[oklch(0.86_0.17_90)]/15 text-foreground")
        }
      >
        <div
          className={
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl " +
            (isDestructive
              ? "bg-destructive text-destructive-foreground"
              : "bg-[oklch(0.86_0.17_90)] text-[oklch(0.20_0.06_258)]")
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{meta.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{msg.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <LogoMark className="mt-0.5 h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
          {msg.answer}
        </p>

        {msg.escalated && <EscalationCard reasons={msg.handoffReasons} />}
        <ReferencesChips refs={msg.references} />
        <SupportCode code={msg.supportCode} errorCode={msg.errorCode} />
        <FeedbackBar msg={msg} onChange={onFeedback} />
      </div>
    </div>
  );
}
