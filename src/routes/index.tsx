import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/chat/Sidebar";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { useChat } from "@/hooks/useChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "supportFAQagent — Suporte técnico HostGator" },
      {
        name: "description",
        content:
          "Tire dúvidas sobre VPS, WhatsApp, Evolution API, n8n e webhooks com respostas baseadas em conhecimento controlado.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { messages, loading, send, updateFeedback, reset } = useChat();
  const [draft, setDraft] = useState("");
  const empty = messages.length === 0;

  function handlePick(text: string) {
    setDraft("");
    send(text);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar onNewChat={reset} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-border/60 px-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="font-serif text-sm text-muted-foreground">
              Chat de suporte
            </span>
          </header>

          {empty ? (
            <main className="flex flex-1 flex-col">
              <EmptyState onPick={handlePick} />
              <div className="pb-8">
                <Composer
                  onSend={send}
                  disabled={loading}
                  value={draft}
                  onValueChange={setDraft}
                />
              </div>
            </main>
          ) : (
            <main className="flex flex-1 flex-col">
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  messages={messages}
                  loading={loading}
                  onFeedback={updateFeedback}
                />
              </div>
              <div className="border-t border-border/40 bg-background/80 py-4 backdrop-blur">
                <Composer
                  onSend={send}
                  disabled={loading}
                  value={draft}
                  onValueChange={setDraft}
                />
              </div>
            </main>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
