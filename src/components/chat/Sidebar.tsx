import { Link, useRouterState } from "@tanstack/react-router";
import { History, LifeBuoy, MessageSquare, Plus, Settings } from "lucide-react";

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
import { Logo } from "@/components/brand/Logo";

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
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <Logo variant="full" className="text-sidebar-foreground" />
          <p className="mt-2 text-[11px] text-sidebar-foreground/65">
            Suporte técnico para VPS, WhatsApp, n8n e Evolution
          </p>
        </div>

        <button
          onClick={onNewChat}
          className="group flex w-full items-center gap-2 rounded-xl bg-[oklch(0.86_0.17_90)] px-3 py-2 text-sm font-medium text-[oklch(0.22_0.06_258)] shadow-sm transition hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
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
                      className="relative data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:h-[calc(100%-12px)] data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r data-[active=true]:before:bg-[oklch(0.86_0.17_90)]"
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
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/55">
            Recentes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {RECENTS.map((r) => (
                <SidebarMenuItem key={r}>
                  <SidebarMenuButton className="text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                    <span className="truncate">{r}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
          <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.17_90)]" />
            <span className="uppercase tracking-wider">Staging V0</span>
          </div>
          <p className="mt-1 text-[11px] text-sidebar-foreground/55">
            WhatsApp auth entra no V1.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
