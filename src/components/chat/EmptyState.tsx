import { ArrowRight, Server, ShieldCheck, Workflow, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

const SUGGESTIONS = [
  { label: "WhatsApp", text: "QR Code do WhatsApp não aparece", icon: MessageCircle },
  { label: "VPS", text: "Evolution API não sobe na VPS", icon: Server },
  { label: "n8n", text: "Webhook do n8n não recebe eventos", icon: Workflow },
  { label: "Segurança", text: "Risco de bloqueio no WhatsApp", icon: ShieldCheck },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-6">
      <div className="relative flex max-w-3xl flex-col items-center text-center">
        <LogoMark className="mb-5 h-12 w-12" />
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.17_90)]" />
          Copiloto de suporte
        </div>
        <h1 className="font-display text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl md:text-[3.75rem]">
          Suporte técnico, <span className="text-primary">direto ao ponto.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-6 text-muted-foreground sm:text-base">
          Explique o erro, o que você já tentou e onde travou. O agente organiza a resposta e gera
          um código de suporte quando precisar escalar para humano.
        </p>
      </div>

      <div className="relative mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.text}
            onClick={() => onPick(item.text)}
            className="group rounded-2xl border border-border bg-card p-4 text-left text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
          >
            <span className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </span>
            <span className="block text-sm leading-snug">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
