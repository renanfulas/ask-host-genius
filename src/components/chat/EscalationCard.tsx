import { LifeBuoy } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  low_confidence: "Contexto insuficiente para responder com segurança",
  provider_error: "Falha temporária no provedor de IA",
  sensitive_topic: "Tema sensível ou de maior risco",
  secret_request: "Pedido envolvendo credenciais ou segredo",
  prompt_injection_attempt: "Pedido inseguro detectado",
  out_of_scope: "Caso fora do escopo da base atual",
  explicit_human_request: "Você pediu atendimento humano",
};

function labelReason(reason: string) {
  return REASON_LABELS[reason] ?? reason.replaceAll("_", " ");
}

export function EscalationCard({ reasons }: { reasons: string[] }) {
  const visibleReasons = reasons.map(labelReason).slice(0, 3);

  return (
    <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/[0.07] p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <LifeBuoy className="h-4 w-4" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            Este caso pode precisar de suporte humano.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Guarde o código de suporte abaixo. Ele ajuda a continuar a conversa sem você repetir
            tudo.
          </p>
          {visibleReasons.length > 0 && (
            <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
              {visibleReasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
