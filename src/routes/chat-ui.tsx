import { createFileRoute } from "@tanstack/react-router";

import { ChatPage } from "./index";

export const Route = createFileRoute("/chat-ui")({
  head: () => ({
    meta: [
      { title: "supportFAQagent - Suporte técnico HostGator" },
      {
        name: "description",
        content:
          "Tire dúvidas sobre VPS, WhatsApp, Evolution API, n8n e webhooks com respostas baseadas em conhecimento controlado.",
      },
    ],
  }),
  component: ChatPage,
});
