// Cliente HTTP para o backend do supportFAQagent.
// Regras: sem API key no browser, sem domain/session_id no body,
// cookie HttpOnly cuida da sessão (credentials: 'include').

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
  constructor(public kind: "network" | "rate_limit" | "server", message: string) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  return (await res.json()) as T;
}

export function postChat(message: string) {
  return post<ChatResponse>("/web/chat", { message });
}

export function postFeedback(input: {
  request_id: string;
  helpful: boolean;
  reason: string;
  comment?: string;
}) {
  return post<FeedbackResponse>("/web/feedback", input);
}
