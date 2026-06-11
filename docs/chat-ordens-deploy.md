# Deploy - chat.ordens.com.br

## Objetivo

Servir o `ask-host-genius` como frontend separado do `supportFAQagent`, mantendo
a mesma origem publica:

- `https://chat.ordens.com.br/chat-ui` -> frontend `ask-host-genius`
- `https://chat.ordens.com.br/web/*` -> backend `supportFAQagent`

Com essa topologia, o browser continua sem receber `X-API-Key`,
`X-LLM-API-Key` ou secrets. O frontend chama `/web/chat` e `/web/feedback` por
mesma origem, preservando cookie `HttpOnly`.

## Variaveis

Para mesma origem, manter vazio:

```dotenv
VITE_API_BASE_URL=
```

Nao configure URL publica de API enquanto o backend nao tiver CORS restrito.

## Build

```bash
npm ci
npm run build
```

## Servico Local Do Frontend

Em staging, rodar em loopback:

```bash
npm run serve:staging
```

Padrao:

```text
127.0.0.1:5173
```

## Reverse Proxy Recomendado

Exemplo Nginx:

```nginx
server {
    server_name chat.ordens.com.br;

    location = /chat-ui {
        proxy_pass http://127.0.0.1:5173/chat-ui;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /assets/ {
        proxy_pass http://127.0.0.1:5173/assets/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /web/ {
        proxy_pass http://127.0.0.1:8000/web/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Smoke

```bash
curl -i https://chat.ordens.com.br/chat-ui

curl -i \
  -H "Content-Type: application/json" \
  -d '{"message":"Como conectar o WhatsApp na Evolution API?"}' \
  https://chat.ordens.com.br/web/chat
```

Esperado:

- `/chat-ui` retorna HTML do frontend novo.
- assets carregam por `/assets/*`.
- `/web/chat` retorna `200`, `X-Request-ID` e cookie de sessao anonima.
- o browser nao envia `X-API-Key` nem `X-LLM-API-Key`.

## Rollback

Remover ou comentar as regras de proxy para `/chat-ui` e `/assets/`.

O backend ainda possui a UI estatica antiga em `/chat-ui`; ela volta a aparecer
se o proxy deixar de sobrepor essa rota.
