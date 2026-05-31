import { useCallback, useState } from "react";
import { ChatApiError, postChat, type ChatResponse } from "@/lib/chat-api";

export type UserMsg = { role: "user"; id: string; text: string };
export type AgentMsg = {
  role: "agent";
  id: string;
  requestId: string;
  answer: string;
  escalated: boolean;
  handoffReasons: string[];
  references: string[];
  supportCode: string;
  errorCode: string | null;
  feedback: { status: "idle" | "sending" | "sent" | "error"; helpful?: boolean };
};
export type ErrorMsg = {
  role: "error";
  id: string;
  kind: "network" | "rate_limit" | "server";
  text: string;
};
export type Msg = UserMsg | AgentMsg | ErrorMsg;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function fromResponse(r: ChatResponse): AgentMsg {
  return {
    role: "agent",
    id: uid(),
    requestId: r.request_id,
    answer: r.answer,
    escalated: r.escalated,
    handoffReasons: r.handoff_reasons ?? [],
    references: r.references ?? [],
    supportCode: r.support_code,
    errorCode: r.error_code,
    feedback: { status: "idle" },
  };
}

export function useChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setMessages((m) => [...m, { role: "user", id: uid(), text: trimmed }]);
      setLoading(true);
      try {
        const r = await postChat(trimmed);
        setMessages((m) => [...m, fromResponse(r)]);
      } catch (e) {
        const err = e instanceof ChatApiError ? e : new ChatApiError("network", "Erro");
        const text =
          err.kind === "rate_limit"
            ? "Muitas perguntas em pouco tempo. Aguarde alguns segundos e tente novamente."
            : err.kind === "network"
              ? "Não consegui responder agora. Verifique sua conexão e tente novamente."
              : "Não consegui responder agora. Tente novamente em instantes.";
        setMessages((m) => [...m, { role: "error", id: uid(), kind: err.kind, text }]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const updateFeedback = useCallback((id: string, patch: Partial<AgentMsg["feedback"]>) => {
    setMessages((m) =>
      m.map((msg) =>
        msg.role === "agent" && msg.id === id
          ? { ...msg, feedback: { ...msg.feedback, ...patch } }
          : msg,
      ),
    );
  }, []);

  const reset = useCallback(() => setMessages([]), []);

  return { messages, loading, send, updateFeedback, reset };
}
