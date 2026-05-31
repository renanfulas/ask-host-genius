import { Link, useRouterState } from "@tanstack/react-router";
import { History, LifeBuoy, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV = [
  { title: "Chat", url: "/", icon: MessageSquare, enabled: true },
  { title: "Histórico", url: "#", icon: History, enabled: false },
  { title: "Suporte humano", url: "#", icon: LifeBuoy, enabled: false },
  { title: "Configurações", url: "#", icon: Settings, enabled: false },
];

const RECENTS = [
  "QR Code do WhatsApp não aparece",
  "Evolution API caiu após reboot",
  "n8n não recebe webhook do Stripe",
  "Limite de sessão na VPS",
  "Token expirado na Evolution",
  "Mensagens duplicadas no n8n",
];

export function AppSidebar({ onNewChat }: { onNewChat: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-4 px-3 pt-4">
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/30 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-serif text-lg leading-none">
                supportFAQagent
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                VPS, WhatsApp, n8n e Evolution
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="group flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/45 px-3 py-2 text-sm text-sidebar-foreground transition hover:border-primary/40 hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span>Novo chat</span>
        </button>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const isActive = item.enabled && pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground"
                    >
                      {item.enabled ? (
                        <Link to="/">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <a
                          href="#"
                          aria-disabled="true"
                          onClick={(e) => e.preventDefault()}
                          className="cursor-not-allowed opacity-55"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
            Recentes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {RECENTS.map((r) => (
                <SidebarMenuItem key={r}>
                  <SidebarMenuButton className="text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground">
                    <span className="truncate">{r}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/25 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
            <span className="uppercase tracking-wider">Staging V0</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground/60">WhatsApp auth entra no V1.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
