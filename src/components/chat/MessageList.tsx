import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { AgentMsg, Msg } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: Msg[];
  loading: boolean;
  onFeedback: (id: string, patch: Partial<AgentMsg["feedback"]>) => void;
};

export function MessageList({ messages, loading, onFeedback }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8" aria-live="polite">
      {messages.map((m) => (
        <MessageBubble key={m.id} msg={m} onFeedback={onFeedback} />
      ))}

      {loading && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border/45 bg-card/35 px-4 py-3 text-sm text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Analisando contexto técnico...
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
