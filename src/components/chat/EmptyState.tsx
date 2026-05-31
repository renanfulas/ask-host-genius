import { ArrowRight, Server, ShieldCheck, Workflow, MessageCircle } from "lucide-react";

const SUGGESTIONS = [
  {
    label: "WhatsApp",
    text: "QR Code do WhatsApp não aparece",
    icon: MessageCircle,
  },
  {
    label: "VPS",
    text: "Evolution API não sobe na VPS",
    icon: Server,
  },
  {
    label: "n8n",
    text: "Webhook do n8n não recebe eventos",
    icon: Workflow,
  },
  {
    label: "Segurança",
    text: "Risco de bloqueio no WhatsApp",
    icon: ShieldCheck,
  },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-6">
      <div className="pointer-events-none absolute inset-x-10 top-10 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-3xl text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          HostGator support copilot
        </div>
        <h1 className="font-serif text-4xl leading-[0.98] text-foreground sm:text-5xl md:text-[4.25rem]">
          Suporte técnico sem perder o fio da conversa.
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
            className="group rounded-2xl border border-border/70 bg-card/45 p-4 text-left text-foreground/85 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:text-foreground"
          >
            <span className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/90">
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
