import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  code: string;
  errorCode?: string | null;
};

export function SupportCode({ code, errorCode }: Props) {
  const [copied, setCopied] = useState(false);
  if (!code && !errorCode) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {code && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/45 px-2.5 py-1">
          <span>Código:</span>
          <code className="font-mono text-[11px] text-foreground/85">{code}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            aria-label="Copiar código de suporte"
            className="rounded p-0.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </span>
      )}
      {errorCode && (
        <span className="rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 font-mono text-[11px] text-destructive/90">
          {errorCode}
        </span>
      )}
    </div>
  );
}
