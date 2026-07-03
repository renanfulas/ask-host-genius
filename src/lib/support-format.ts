// Labels e formatação staff-facing (pt-BR) do console do time.
// Só apresentação: nenhuma regra de negócio é derivada aqui.

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { CaseStatus, TransitionAction } from "./support-api";

export const STATUS_LABELS: Record<CaseStatus, string> = {
  open: "Aberto",
  in_progress: "Em atendimento",
  waiting_customer: "Aguardando cliente",
  pending_consent: "Aguardando consentimento",
  closed: "Encerrado",
  cancelled: "Cancelado",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as CaseStatus] ?? status;
}

export const ACTION_LABELS: Record<TransitionAction, string> = {
  claim: "Assumir",
  release: "Devolver à fila",
  wait_customer: "Aguardar cliente",
  resume: "Retomar",
  close: "Encerrar",
  cancel: "Cancelar caso",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action as TransitionAction] ?? action;
}

// Espelha a matriz de transições do contrato (fonte: integration-contracts.md)
// só para decidir quais botões mostrar; o backend segue sendo a autoridade —
// qualquer transição fora disso volta 409 e a tela apenas reflete o estado real.
const ALLOWED_ACTIONS: Record<CaseStatus, TransitionAction[]> = {
  open: ["claim", "cancel"],
  in_progress: ["release", "wait_customer", "close", "cancel"],
  waiting_customer: ["resume"],
  pending_consent: ["cancel"],
  closed: [],
  cancelled: [],
};

export function allowedActionsForStatus(status: string): TransitionAction[] {
  return ALLOWED_ACTIONS[status as CaseStatus] ?? [];
}

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  normal: "Normal",
  low: "Baixa",
};

export function priorityLabel(priority: string | null | undefined): string | null {
  if (!priority) return null;
  return PRIORITY_LABELS[priority] ?? priority;
}

export const REASON_LABELS: Record<string, string> = {
  low_confidence: "Baixa confiança",
  explicit_human_request: "Pedido de humano",
  sensitive_topic: "Tema sensível",
  secret_request: "Pedido de segredo",
  prompt_injection_attempt: "Tentativa de injeção",
  out_of_scope: "Fora de escopo",
  provider_error: "Erro do provider",
};

export function reasonLabel(code: string): string {
  return REASON_LABELS[code] ?? code;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true });
  } catch {
    return iso;
  }
}

/** 5400 -> "1 h 30 min"; 90 -> "1 min 30 s"; 45 -> "45 s". */
export function formatDurationSeconds(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  const total = Math.round(seconds);
  if (total < 60) return `${total} s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours === 0) {
    const rest = total % 60;
    return rest > 0 && minutes < 10 ? `${minutes} min ${rest} s` : `${minutes} min`;
  }
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

/** Normaliza a digitação para E.164 (só apresentação; o backend valida). */
export function normalizePhoneInput(raw: string): string {
  const cleaned = raw.replace(/[\s().-]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export const PHONE_RE = /^\+[1-9]\d{7,14}$/;
