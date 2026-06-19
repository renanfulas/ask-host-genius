## Objetivo

Adaptar o front-end atual para um tema **claro corporativo** alinhado ao universo visual da HostGator (azul-marinho + azul vibrante + amarelo + fundo branco/azul-claríssimo), preservando toda a lógica de chat já implementada. Sem copiar logo, mascote, wordmark ou textos da marca.

## 1. Paleta (src/styles.css)

Substituir o tema "warm charcoal" por um light theme em `oklch`:

- `--background`: branco com leve tinta azul (`oklch(0.99 0.005 245)`)
- `--foreground` / texto principal: azul-marinho profundo (`oklch(0.22 0.06 255)`) — equivalente a um navy ~#1B2A4E
- `--card`: branco puro, com borda sutil azul-acinzentada
- `--primary` (CTA, botão enviar): azul vibrante (`oklch(0.58 0.20 255)`) ~ #2D6BFF
- `--accent` (destaques, badge "Staging", anel de foco): amarelo HostGator (`oklch(0.86 0.17 90)`) ~ #FFCC1F
- `--muted` / `--muted-foreground`: cinza-azulado claro
- `--sidebar`: azul-marinho escuro (`oklch(0.20 0.05 258)`) com texto claro — cria contraste lateral parecido com header do site
- `--border`: `oklch(0.22 0.06 255 / 12%)`
- Remover `class="dark"` forçada do `<html>` em `__root.tsx`; o app passa a ser light-only.
- Trocar gradientes do `body` por um fundo branco com um leve glow azul no topo.

## 2. Tipografia

Substituir Instrument Serif + Inter por uma dupla mais corporativa e próxima do site:

- **Headings / wordmark**: `Poppins` (600/700) — sans-serif geométrica com a mesma sensação do título da HostGator.
- **Body / UI**: `Inter` (400/500/600) — mantém.
- Carregar via `<link>` no `__root.tsx` (preconnect + stylesheet do Google Fonts), nunca via `@import` no CSS.
- Atualizar `--font-serif` → renomear papel para `--font-display` (Poppins) e ajustar `font-serif` nos componentes (`EmptyState`, `Sidebar`, header).

## 3. Logo próprio do supportFAQagent

Gerar um símbolo simples e original (sem mascote, sem referência ao jacaré):

- SVG inline: bolha de chat arredondada em **azul vibrante** com um check/spark **amarelo** dentro.
- Acompanhado do wordmark "supportFAQagent" em Poppins 600, cor navy.
- Arquivo: `src/components/brand/Logo.tsx` (componente React com SVG inline, aceita `size` e variant `mark | full`).
- Usado no `Sidebar` (variante `full`) e como favicon/OG (variante `mark` exportada para `public/`).

## 4. Ajustes de componentes (sem mexer em lógica)

- **Sidebar**: fundo navy, itens com texto claro, hover em azul levemente mais claro, item ativo com barra amarela à esquerda. Badge "Staging V0" em amarelo sobre navy. Logo no topo substitui o ícone `Sparkles`.
- **Header (área central)**: barra branca com borda inferior cinza-azul; badge "Staging V0" em amarelo discreto.
- **EmptyState**: headline em Poppins navy; chip superior em azul/amarelo; cards de sugestão brancos com borda azul-clara, hover eleva e troca borda para azul vibrante; ícones em azul.
- **Composer**: card branco com sombra suave, borda azul-clara, foco em anel azul vibrante; botão enviar azul vibrante com texto branco; dica em cinza-azul.
- **MessageBubble**:
  - User: bolha azul vibrante com texto branco (alto contraste).
  - Agent: sem bolha, texto navy direto no fundo (conforme boas práticas de chat).
  - References chips: fundo azul-claríssimo, texto azul vibrante.
  - SupportCode: monospace cinza-azul com botão copiar.
  - EscalationCard: borda amarela + ícone amarelo, fundo amarelo-creme bem leve.
  - FeedbackBar: botões outline azul; estado "enviado" em verde discreto.
- **Loading "Analisando contexto técnico..."**: pulse em azul vibrante.

## 5. Meta / favicon

- `__root.tsx`: favicon usando a `Logo mark` (PNG/SVG gerado em `public/favicon.svg`).
- `index.tsx`: manter title/description; trocar OG color hint se houver.

## 6. Fora de escopo

- Não tocar em `useChat`, `chat-api.ts`, fluxo de envio, feedback, escalonamento ou endpoints.
- Não adicionar dark mode toggle (foi escolhido light-only).
- Não copiar logo, mascote (jacaré), wordmark "HostGator", ícones proprietários ou textos da landing.

## Arquivos afetados

```text
src/styles.css                       → nova paleta light + tokens
src/routes/__root.tsx                → remove class="dark", troca fontes (Poppins+Inter), favicon
src/components/brand/Logo.tsx        → NOVO componente de marca própria
src/components/chat/Sidebar.tsx      → navy sidebar + logo
src/components/chat/EmptyState.tsx   → headline Poppins + cards azul-claros
src/components/chat/Composer.tsx     → card branco + botão azul
src/components/chat/MessageBubble.tsx → user navy/azul, agent sem bolha
src/components/chat/ReferencesChips.tsx
src/components/chat/EscalationCard.tsx → acento amarelo
src/components/chat/FeedbackBar.tsx
src/components/chat/SupportCode.tsx
src/routes/index.tsx                 → header light + badge amarelo
public/favicon.svg                   → NOVO (logo mark)
```

## Nota sobre identidade

O resultado vai **lembrar** a HostGator em paleta e densidade (navy + azul vibrante + amarelo + tipografia geométrica + fundo claro), mas com logo, wordmark e textos exclusivos do `supportFAQagent`. Isso evita uso indevido de marca registrada e mantém o produto com identidade própria.
