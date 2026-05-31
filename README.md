# ask-host-genius

Frontend web do `supportFAQagent` para suporte técnico HostGator. A interface
consome somente a fachada pública controlada do backend:

- `POST /web/chat`
- `POST /web/feedback`

O navegador não deve receber `X-API-Key`, `X-LLM-API-Key` ou chaves de
provider.

## Desenvolvimento local

Pré-requisito: iniciar o backend `supportFAQagent` em
`http://127.0.0.1:8765`.

Instale dependências e suba o frontend:

```powershell
npm.cmd install --no-package-lock
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Abra:

```text
http://127.0.0.1:5173/
```

O Vite encaminha requests `/web/*` para o backend local. Para usar outra
porta, copie `.env.example` para `.env.local` e ajuste:

```dotenv
VITE_BACKEND_PROXY_TARGET=http://127.0.0.1:8765
```

## Contrato de integração

O frontend envia apenas:

```json
{
  "message": "Como conectar o WhatsApp na Evolution API?"
}
```

O backend resolve a sessão anônima por cookie `HttpOnly`. Não envie `domain`
ou `session_id` pelo browser.

## Deploy separado

Para deploy em origem diferente do backend, configure
`VITE_API_BASE_URL=https://api.example.com` somente depois de restringir CORS
no `supportFAQagent`. Em produção, prefira reverse proxy no mesmo domínio:

```text
/         -> ask-host-genius
/web/*    -> supportFAQagent
```

## Validação

```powershell
npm.cmd run lint
npm.cmd run build
```

O smoke local deve confirmar:

- chat via `/web/chat`
- feedback via `/web/feedback`
- cookie anônimo preservado
- ausência de API keys no browser
