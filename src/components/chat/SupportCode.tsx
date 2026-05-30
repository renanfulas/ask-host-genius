import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function SupportCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Código de suporte:</span>
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
        {code}
      </code>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copiar código de suporte"
        className="rounded p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
