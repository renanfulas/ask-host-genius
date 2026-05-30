const SUGGESTIONS = [
  "QR Code do WhatsApp não aparece",
  "Evolution API não sobe na VPS",
  "Webhook do n8n não recebe eventos",
  "Risco de bloqueio no WhatsApp",
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-6">
      <h1 className="font-serif text-3xl text-center leading-tight text-foreground sm:text-4xl md:text-[2.75rem]">
        Como posso ajudar com sua VPS ou WhatsApp?
      </h1>
      <p className="mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
        Explique o erro, o que você já tentou e onde travou.
      </p>

      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="group rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-left text-sm text-foreground/85 transition hover:border-primary/40 hover:bg-card hover:text-foreground"
          >
            <span className="block leading-snug">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
