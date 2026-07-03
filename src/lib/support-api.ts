// Cliente HTTP da fachada staff /web/support/* (console do time).
// Regras: same-origin, sem API key, sem telefone bruto persistido no cliente;
// cookies HttpOnly viajam sozinhos (credentials: "include").
// Semáforo, prazo, ordenação e permissão vêm prontos do backend — a UI não
// recalcula regra de negócio.

import { z } from "zod";

export type SupportErrorKind =
  | "network"
  | "unauthorized"
  | "csrf"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "invalid"
  | "storage"
  | "server";

export class SupportApiError extends Error {
  constructor(
    public kind: SupportErrorKind,
    message: string,
    public options: {
      /** código de erro do backend quando presente (ex.: invalid_phone) */
      code?: string;
      /** segundos do header Retry-After em respostas 429 */
      retryAfterSeconds?: number;
      /** status atual do caso em 409 invalid_transition */
      conflictStatus?: string;
    } = {},
  ) {
    super(message);
    this.name = "SupportApiError";
  }
}

// ---------- Schemas (defesa contra payload fora do contrato) ----------

export const caseStatusValues = [
  "open",
  "in_progress",
  "waiting_customer",
  "pending_consent",
  "closed",
  "cancelled",
] as const;
export type CaseStatus = (typeof caseStatusValues)[number];

export const transitionActionValues = [
  "claim",
  "release",
  "wait_customer",
  "resume",
  "close",
  "cancel",
] as const;
export type TransitionAction = (typeof transitionActionValues)[number];

const slaSchema = z.object({
  deadline_at: z.string().nullable(),
  elapsed_ratio: z.number().nullable(),
  color: z.enum(["green", "yellow", "red"]),
  paused: z.boolean(),
  explanation: z.string().nullish(),
});
export type CaseSla = z.infer<typeof slaSchema>;

const assigneeSchema = z.object({ display_name: z.string() }).nullable();
export type CaseAssignee = z.infer<typeof assigneeSchema>;

const caseSummarySchema = z.object({
  case_id: z.string(),
  domain: z.string(),
  status: z.enum(caseStatusValues),
  priority: z.string().nullish(),
  channel: z.string().nullish(),
  request_id: z.string().nullish(),
  reason_codes: z.array(z.string()).default([]),
  summary: z.string().nullish(),
  turn_count: z.number().nullish(),
  opened_at: z.string(),
  updated_at: z.string().nullish(),
  sla: slaSchema.nullable().default(null),
  assignee: assigneeSchema.default(null),
});
export type CaseSummary = z.infer<typeof caseSummarySchema>;

const casesResponseSchema = z.object({
  request_id: z.string().nullish(),
  view: z.string().nullish(),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
  truncated: z.boolean().default(false),
  cases: z.array(caseSummarySchema),
});
export type CasesResponse = z.infer<typeof casesResponseSchema>;

const transcriptTurnSchema = z.object({
  sequence: z.number(),
  role: z.string(),
  content: z.string(),
  confidence: z.number().nullish(),
  escalated: z.boolean().nullish(),
  handoff_reasons: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
  error_code: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type TranscriptTurn = z.infer<typeof transcriptTurnSchema>;

const caseEventSchema = z.object({
  action: z.string(),
  from_status: z.string(),
  to_status: z.string(),
  note: z.string().nullish(),
  actor_display_name: z.string().nullish(),
  created_at: z.string(),
});
export type CaseEvent = z.infer<typeof caseEventSchema>;

const customerSchema = z
  .object({
    display_label: z.string().nullish(),
    email: z.string().nullish(),
    phone_last4: z.string().nullish(),
  })
  .nullable();

const caseDetailSchema = z.object({
  request_id: z.string().nullish(),
  case_id: z.string(),
  domain: z.string(),
  status: z.enum(caseStatusValues),
  priority: z.string().nullish(),
  channel: z.string().nullish(),
  case_request_id: z.string().nullish(),
  reason_codes: z.array(z.string()).default([]),
  summary: z.string().nullish(),
  references: z.array(z.string()).default([]),
  turn_count: z.number().nullish(),
  opened_at: z.string(),
  updated_at: z.string().nullish(),
  customer: customerSchema.default(null),
  transcript: z.array(transcriptTurnSchema).default([]),
  sla: slaSchema.nullable().default(null),
  assignee: assigneeSchema.default(null),
  events: z.array(caseEventSchema).default([]),
});
export type CaseDetail = z.infer<typeof caseDetailSchema>;

const transitionResponseSchema = z.object({
  case_id: z.string(),
  status: z.enum(caseStatusValues),
  assignee: assigneeSchema.default(null),
});
export type TransitionResponse = z.infer<typeof transitionResponseSchema>;

const authStartResponseSchema = z.object({
  challenge_id: z.string(),
  expires_in_seconds: z.number(),
  retry_after_seconds: z.number(),
});
export type AuthStartResponse = z.infer<typeof authStartResponseSchema>;

const authConfirmResponseSchema = z.object({
  display_name: z.string(),
  expires_at: z.string(),
});
export type AuthConfirmResponse = z.infer<typeof authConfirmResponseSchema>;

const sessionOkSchema = z.object({
  authenticated: z.literal(true),
  display_name: z.string(),
  expires_at: z.string(),
});
const sessionAnonSchema = z.object({
  authenticated: z.literal(false).default(false),
  hint: z.object({ display_name: z.string() }).nullish(),
});
export type StaffSession =
  | z.infer<typeof sessionOkSchema>
  | { authenticated: false; hint: { display_name: string } | null };

const metricsResponseSchema = z.object({
  backlog: z.object({
    by_color: z.record(z.string(), z.number()).default({}),
    by_status: z.record(z.string(), z.number()).default({}),
    truncated: z.boolean().default(false),
  }),
  throughput: z.array(z.object({ day: z.string(), opened: z.number(), closed: z.number() })),
  escalation_reasons: z.array(z.object({ reason_code: z.string(), count: z.number() })),
  feedback: z.object({
    helpful: z.number(),
    not_helpful: z.number(),
    helpful_rate: z.number().nullable(),
    unknown_domain_count: z.number().default(0),
    sample_note: z.string().nullish(),
  }),
  response_times: z.object({
    median_seconds_to_first_action: z.number().nullable(),
    median_seconds_to_close: z.number().nullable(),
  }),
});
export type MetricsResponse = z.infer<typeof metricsResponseSchema>;

// ---------- Transporte ----------

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function detailOf(raw: unknown): { code?: string; status?: string } {
  if (typeof raw !== "object" || raw === null) return {};
  const detail = (raw as { detail?: unknown }).detail;
  if (typeof detail === "string") return { code: detail };
  if (typeof detail === "object" && detail !== null) {
    const d = detail as { code?: unknown; status?: unknown };
    return {
      code: typeof d.code === "string" ? d.code : undefined,
      status: typeof d.status === "string" ? d.status : undefined,
    };
  }
  return {};
}

async function bodyOf(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function toError(res: Response): Promise<SupportApiError> {
  const raw = await bodyOf(res);
  const { code, status } = detailOf(raw);
  switch (res.status) {
    case 400:
      return new SupportApiError("invalid", "Código inválido ou expirado.", { code });
    case 401:
      return new SupportApiError("unauthorized", "Sessão expirada ou inválida.", { code });
    case 403:
      return code === "csrf_header_required"
        ? new SupportApiError("csrf", "Requisição bloqueada (CSRF).", { code })
        : new SupportApiError("unauthorized", "Acesso negado.", { code });
    case 404:
      return new SupportApiError("not_found", "Recurso não encontrado.", { code });
    case 409:
      return new SupportApiError("conflict", "O caso mudou de estado.", {
        code,
        conflictStatus: status,
      });
    case 422:
      return new SupportApiError("invalid", "Dados inválidos.", { code });
    case 429: {
      const retryAfter = Number(res.headers.get("Retry-After"));
      return new SupportApiError("rate_limit", "Muitas tentativas. Aguarde um pouco.", {
        code,
        retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      });
    }
    case 503:
      return new SupportApiError("storage", "Banco de dados indisponível no momento.", { code });
    default:
      return new SupportApiError("server", `Erro ${res.status}`, { code });
  }
}

async function request<T>(
  path: string,
  schema: { parse: (v: unknown) => T },
  init: { method?: string; body?: unknown; csrf?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  // Exigido pelo backend nas escritas (403 csrf_header_required sem ele).
  if (init.csrf) headers["X-Requested-With"] = "XMLHttpRequest";

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers,
      credentials: "include",
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new SupportApiError("network", "Falha de rede.");
  }

  if (!res.ok) throw await toError(res);

  const raw = await bodyOf(res);
  try {
    return schema.parse(raw);
  } catch {
    throw new SupportApiError("server", "Resposta fora do formato esperado.");
  }
}

// ---------- Auth ----------

export function startStaffAuth(phone?: string): Promise<AuthStartResponse> {
  return request("/web/support/auth/start", authStartResponseSchema, {
    body: phone ? { phone } : {},
  });
}

export function confirmStaffAuth(input: {
  challenge_id: string;
  code: string;
  phone?: string;
}): Promise<AuthConfirmResponse> {
  const body: Record<string, string> = {
    challenge_id: input.challenge_id,
    code: input.code,
  };
  // Primeiro acesso: reenviar o telefone vincula o lembrete de dispositivo.
  if (input.phone) body.phone = input.phone;
  return request("/web/support/auth/confirm", authConfirmResponseSchema, { body });
}

/** Guard de rota: 200 autenticado, 401 traz o hint do lembrete (1 clique). */
export async function getStaffSession(): Promise<StaffSession> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/web/support/auth/session`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });
  } catch {
    throw new SupportApiError("network", "Falha de rede.");
  }

  if (res.ok) {
    const raw = await bodyOf(res);
    try {
      return sessionOkSchema.parse(raw);
    } catch {
      throw new SupportApiError("server", "Resposta fora do formato esperado.");
    }
  }
  if (res.status === 401) {
    const raw = await bodyOf(res);
    const parsed = sessionAnonSchema.safeParse(raw);
    return { authenticated: false, hint: parsed.success ? (parsed.data.hint ?? null) : null };
  }
  throw await toError(res);
}

export function staffLogout(forgetDevice = false): Promise<void> {
  return request(
    "/web/support/auth/logout",
    { parse: () => undefined },
    {
      body: forgetDevice ? { forget_device: true } : {},
    },
  );
}

// ---------- Fila, detalhe, transições ----------

export type CasesQuery = {
  view?: "active" | "history";
  status?: string;
  domain?: string;
  color?: "green" | "yellow" | "red" | "paused";
  sort?: "attention" | "opened_at";
  assignee?: "me";
  limit?: number;
  offset?: number;
};

export function listSupportCases(query: CasesQuery = {}): Promise<CasesResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return request(`/web/support/cases${qs ? `?${qs}` : ""}`, casesResponseSchema);
}

export function getSupportCase(caseId: string): Promise<CaseDetail> {
  return request(`/web/support/cases/${encodeURIComponent(caseId)}`, caseDetailSchema);
}

export function transitionSupportCase(
  caseId: string,
  action: TransitionAction,
  note?: string,
): Promise<TransitionResponse> {
  const body: Record<string, string> = { action };
  if (note && note.trim()) body.note = note.trim();
  return request(
    `/web/support/cases/${encodeURIComponent(caseId)}/transition`,
    transitionResponseSchema,
    { body, csrf: true },
  );
}

// ---------- Métricas ----------

export function getSupportMetrics(
  window: "14d" | "30d",
  domain?: string,
): Promise<MetricsResponse> {
  const params = new URLSearchParams({ window });
  if (domain) params.set("domain", domain);
  return request(`/web/support/metrics?${params.toString()}`, metricsResponseSchema);
}
