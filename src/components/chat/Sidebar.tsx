import { Link, useRouterState } from "@tanstack/react-router";
import {
  MessageSquare,
  History,
  LifeBuoy,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";

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
      <SidebarHeader className="gap-3 px-3 pt-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-serif text-lg leading-none">supportFAQagent</span>
        </div>

        <button
          onClick={onNewChat}
          className="group flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-sidebar-accent hover:border-primary/40"
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
                      <Link
                        to={item.url}
                        aria-disabled={!item.enabled}
                        onClick={(e) => {
                          if (!item.enabled) e.preventDefault();
                        }}
                        className={!item.enabled ? "opacity-55 cursor-not-allowed" : ""}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
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
                  <SidebarMenuButton className="text-sidebar-foreground/75 hover:text-sidebar-foreground">
                    <span className="truncate">{r}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          <span className="uppercase tracking-wider">Staging V0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
