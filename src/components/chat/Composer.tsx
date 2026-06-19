import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Plus } from "lucide-react";

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
    if (onValueChange) onValueChange(v);
    else setInternal(v);
  };
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [text]);

  function submit() {
    const v = text.trim();
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="group relative overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[0_18px_60px_-32px_rgba(20,40,120,0.18)] transition focus-within:border-primary/60 focus-within:shadow-[0_18px_60px_-28px_rgba(45,107,255,0.35)]">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Explique sua dúvida sobre VPS, WhatsApp, Evolution API ou n8n..."
          className="block w-full resize-none bg-transparent px-5 pb-16 pt-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              aria-label="Anexos indisponíveis na V0"
              className="pointer-events-auto flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-border bg-background text-muted-foreground/60"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-[11px] text-muted-foreground">
              Enter envia / Shift+Enter quebra linha
            </span>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !text.trim()}
            aria-label="Enviar mensagem"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Respostas com base controlada. Valide antes de aplicar em produção.
      </p>
    </div>
  );
}
