import { z } from "zod";

// Strip ASCII control chars (except \n, \r, \t) and zero-width / bidi-override
// chars commonly used in prompt-injection and homoglyph attacks.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const INVISIBLE_RE = /[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g;

export function sanitizeUserText(raw: string): string {
  return raw.replace(CONTROL_RE, "").replace(INVISIBLE_RE, "").trim();
}

export const CHAT_MAX_LEN = 2000;
export const FEEDBACK_COMMENT_MAX = 500;

export const chatMessageSchema = z
  .string()
  .transform(sanitizeUserText)
  .pipe(
    z
      .string()
      .min(1, "Escreva sua dúvida antes de enviar.")
      .max(CHAT_MAX_LEN, `Máximo de ${CHAT_MAX_LEN} caracteres.`),
  );

export const feedbackSchema = z.object({
  request_id: z.string().min(1).max(128),
  helpful: z.boolean(),
  reason: z.enum(["resolved", "not_resolved"]),
  comment: z
    .string()
    .transform(sanitizeUserText)
    .pipe(z.string().max(FEEDBACK_COMMENT_MAX))
    .optional(),
});

// Server response schemas — defense against malformed payloads.
export const chatResponseSchema = z.object({
  request_id: z.string(),
  answer: z.string(),
  escalated: z.boolean(),
  handoff_reasons: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
  support_code: z.string(),
  error_code: z.string().nullable(),
});

export const feedbackResponseSchema = z.object({
  feedback_id: z.string(),
  accepted: z.boolean(),
  status: z.string(),
  storage: z.string(),
});

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
