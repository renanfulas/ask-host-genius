import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { CHAT_MAX_LEN, sanitizeUserText } from "@/lib/validation";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  value?: string;
  onValueChange?: (v: string) => void;
};

export function Composer({ onSend, disabled, value, onValueChange }: Props) {
  const [internal, setInternal] = useState("");
  const text = value ?? internal;
  const setText = (v: string) => {
    // Hard cap + strip control/invisible chars on every keystroke.
    const safe = sanitizeUserText(v).slice(0, CHAT_MAX_LEN);
    if (onValueChange) onValueChange(safe);
    else setInternal(safe);
  };
  const ref = useRef<HTMLTextAreaElement>(null);
  const hintId = useId();
  const counterId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [text]);

  function submit() {
    const v = sanitizeUserText(text);
    if (!v || disabled) return;
    onSend(v);
    setText("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const remaining = CHAT_MAX_LEN - text.length;
  const nearLimit = remaining <= 100;
  const overLimit = remaining < 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="group relative overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[0_18px_60px_-32px_rgba(20,40,120,0.18)] transition focus-within:border-primary/60 focus-within:shadow-[0_18px_60px_-28px_rgba(45,107,255,0.35)]">
        <label htmlFor={`${hintId}-input`} className="sr-only">
          Mensagem para o agente de suporte
        </label>
        <textarea
          id={`${hintId}-input`}
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
          maxLength={CHAT_MAX_LEN}
          aria-describedby={`${hintId} ${counterId}`}
          aria-invalid={overLimit || undefined}
          spellCheck
          autoComplete="off"
          placeholder="Explique sua dúvida sobre VPS, WhatsApp, Evolution API ou n8n..."
          className="block w-full resize-none bg-transparent px-5 pb-16 pt-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-4 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              disabled
              aria-label="Anexos indisponíveis na versão atual"
              className="pointer-events-auto flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-border bg-background text-muted-foreground/70"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span id={hintId} className="hidden truncate text-[11px] text-muted-foreground sm:inline">
              Enter envia / Shift+Enter quebra linha
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              id={counterId}
              aria-live="polite"
              className={
                "text-[11px] tabular-nums " +
                (overLimit
                  ? "font-medium text-destructive"
                  : nearLimit
                    ? "text-foreground"
                    : "text-muted-foreground")
              }
            >
              {text.length}/{CHAT_MAX_LEN}
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !text.trim() || overLimit}
              aria-label="Enviar mensagem"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Respostas com base controlada. Valide antes de aplicar em produção.
      </p>
    </div>
  );
}
