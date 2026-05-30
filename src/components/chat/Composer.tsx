import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

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

  // auto-grow
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
      <div className="group relative rounded-2xl border border-border bg-card/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition focus-within:border-primary/50 focus-within:bg-card">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Explique sua dúvida sobre VPS, WhatsApp, Evolution API ou n8n..."
          className="block w-full resize-none bg-transparent px-5 pb-14 pt-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-60"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-3">
          <span className="text-[11px] text-muted-foreground/60">
            Enter envia · Shift+Enter quebra linha
          </span>
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
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
        Respostas geradas com base controlada. Sempre valide antes de aplicar em produção.
      </p>
    </div>
  );
}
