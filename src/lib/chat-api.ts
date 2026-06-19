// Cliente HTTP para o backend do supportFAQagent.
// Regras: sem API key no browser, sem domain/session_id no body,
// cookie HttpOnly cuida da sessão (credentials: "include").

import {
  chatMessageSchema,
  chatResponseSchema,
  feedbackResponseSchema,
  feedbackSchema,
  ValidationError,
} from "./validation";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type ChatResponse = {
  request_id: string;
  answer: string;
  escalated: boolean;
  handoff_reasons: string[];
  references: string[];
  support_code: string;
  error_code: string | null;
};

export type FeedbackResponse = {
  feedback_id: string;
  accepted: boolean;
  status: string;
  storage: string;
};

export class ChatApiError extends Error {
  constructor(
    public kind: "network" | "rate_limit" | "server" | "validation",
    message: string,
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown, schema: { parse: (v: unknown) => T }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ChatApiError("network", "Falha de rede");
  }

  if (res.status === 429) {
    throw new ChatApiError("rate_limit", "Muitas requisições. Aguarde alguns instantes.");
  }
  if (!res.ok) {
    throw new ChatApiError("server", `Erro ${res.status}`);
  }
  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    throw new ChatApiError("server", "Resposta inválida do servidor.");
  }
  try {
    return schema.parse(raw);
  } catch {
    throw new ChatApiError("server", "Resposta fora do formato esperado.");
  }
}

export function postChat(message: string) {
  const parsed = chatMessageSchema.safeParse(message);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Mensagem inválida.");
  }
  return post<ChatResponse>("/web/chat", { message: parsed.data }, chatResponseSchema);
}

export function postFeedback(input: {
  request_id: string;
  helpful: boolean;
  reason: "resolved" | "not_resolved";
  comment?: string;
}) {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Feedback inválido.");
  }
  return post<FeedbackResponse>("/web/feedback", parsed.data, feedbackResponseSchema);
}
