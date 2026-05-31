## Visão geral

Construir uma única tela de chat (rota `/`) que abre direto na conversa, com sidebar à esquerda, área central com greeting + sugestões, composer grande embaixo, e integração com os endpoints `/web/chat` e `/web/feedback`. Sem landing, sem auth no client, sem API keys no navegador.

## Design system (src/styles.css)

Tema dark "warm charcoal" com acento cobre/laranja discreto:

- `--background`: oklch(0.16 0.012 60) — carvão quente
- `--foreground`: oklch(0.94 0.01 80) — off-white
- `--muted`: oklch(0.22 0.012 60), `--muted-foreground`: oklch(0.68 0.015 70)
- `--sidebar`: oklch(0.13 0.01 60), bordas em oklch(1 0 0 / 6%)
- `--primary` (acento cobre): oklch(0.68 0.13 45)
- `--accent-soft` para chips de referência
- Tipografia: heading "Instrument Serif" (greeting) + body "Inter" (UI/chat) via Google Fonts no `<head>` do \_\_root.
- Raio: 14–18px nos cards/composer. Sombras leves. Espaçamento generoso.
- App força `class="dark"` no `<html>` (sem toggle).

## Estrutura de arquivos

```text
src/routes/index.tsx                  → tela do chat (substitui placeholder)
src/components/chat/Sidebar.tsx       → sidebar com nav + recents mock + footer "Staging V0"
src/components/chat/EmptyState.tsx    → greeting + subtexto + 4 sugestões
src/components/chat/MessageList.tsx   → render do histórico
src/components/chat/MessageBubble.tsx → bolha user/agent + references + escalonamento + feedback
src/components/chat/Composer.tsx      → textarea auto-grow, Enter envia, Shift+Enter quebra
src/components/chat/ReferencesChips.tsx
src/components/chat/EscalationCard.tsx
src/components/chat/FeedbackBar.tsx
src/components/chat/SupportCode.tsx
src/lib/chat-api.ts                   → fetch wrappers postChat / postFeedback (credentials: 'include')
src/hooks/useChat.ts                  → estado local de mensagens + envio + loading + erros
```

Sidebar usa o shadcn Sidebar existente (`collapsible="icon"`, `SidebarTrigger` no header mobile).

## Fluxo de chat

Estado em memória (sem persistência) gerenciado por `useChat`:

```ts
type Msg =
  | { role: "user"; id: string; text: string }
  | {
      role: "agent";
      id: string;
      requestId: string;
      answer: string;
      escalated: boolean;
      handoffReasons: string[];
      references: string[];
      supportCode: string;
      errorCode: string | null;
      feedback?: { status: "idle" | "sending" | "sent" | "error"; helpful?: boolean };
    };
```

- `send(text)`: push user msg → estado `loading` ("Analisando contexto técnico...") → `POST /web/chat` → push agent msg. Em erro de rede mostra bolha de erro amigável ("Não consegui responder agora..."). Em 429 mostra mensagem específica de rate-limit. Em `error_code` no payload mostra mensagem amigável sem stack.
- Sugestões: clicar preenche composer e envia.
- Composer: textarea auto-grow (máx ~8 linhas), botão send (ícone `ArrowUp` do lucide), atalho Enter / Shift+Enter, disabled durante loading.

## Renderização da resposta do agente

Cada bolha do agente mostra, na ordem:

1. Texto da resposta (markdown via `react-markdown` se instalado; senão whitespace-pre-wrap).
2. Se `escalated=true`: `EscalationCard` (texto da copy de escalonamento + lista discreta de `handoff_reasons`).
3. Se `references.length`: `ReferencesChips` com label "Base usada:" + chips pequenos.
4. `SupportCode` discreto em monospace: "Código de suporte: <support_code>" (com botão copiar).
5. `FeedbackBar`: "Essa resposta ajudou?" + botões 👍 / 👎. Ao clicar, envia `POST /web/feedback` com `{ request_id, helpful, reason: helpful?'resolved':'not_resolved' }`. Mostra "Obrigado pelo feedback." no sucesso, "Não foi possível enviar o feedback." no erro. Botões viram disabled após sucesso.

## API client (src/lib/chat-api.ts)

```ts
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
// fetch com credentials: 'include' para cookie HttpOnly
// nunca envia X-API-Key, X-LLM-API-Key, domain, session_id
// trata 429 separadamente
```

Adicionar `VITE_API_BASE_URL` opcional; sem ele usa origem atual (chamadas same-origin).

## Estados cobertos

Vazio, user msg, agent msg, loading, erro de rede, 429, escalado, feedback enviado, feedback com erro — todos com componentes/dedicated UI listados acima.

## Acessibilidade & responsivo

- Sidebar colapsável; em mobile vira off-canvas com `SidebarTrigger` no topo da área central.
- `aria-live="polite"` no container de mensagens.
- Botões com `aria-label`. Foco visível com ring cobre.
- Largura da conversa máx ~760px centralizada; composer com mesma largura.

## SEO / \_\_root

- `__root.tsx`: adicionar `<link>` Google Fonts (Instrument Serif + Inter) e classe `dark` no `<html>`.
- `index.tsx`: head com title "supportFAQagent — Suporte técnico HostGator" e meta description curta.

## Fora de escopo

- Sem persistência de histórico (lista de recents é mock estático).
- Sem rotas extras (Histórico/Suporte humano/Configurações são links visuais sem destino — `to="#"` com `aria-disabled`).
- Sem backend novo: assume que `/web/chat` e `/web/feedback` já existem no mesmo domínio (ou apontados por `VITE_API_BASE_URL`).
- Sem auth UI (cookie HttpOnly cuida disso).
