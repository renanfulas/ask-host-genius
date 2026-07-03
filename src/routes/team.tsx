import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Loader2, LogOut, RefreshCw } from "lucide-react";

import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { TeamLogin } from "@/components/team/TeamLogin";
import { Button } from "@/components/ui/button";
import { STAFF_SESSION_KEY, useStaffSession } from "@/hooks/useStaffSession";
import { staffLogout } from "@/lib/support-api";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Console do time - supportFAQagent" }],
  }),
  component: TeamLayout,
});

const NAV_LINK_CLASS =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground";

function TeamLayout() {
  const session = useStaffSession();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => staffLogout(false),
    onSettled: () => {
      queryClient.setQueryData(STAFF_SESSION_KEY, { authenticated: false, hint: null });
      void queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível verificar sua sessão. Verifique a conexão.
        </p>
        <Button variant="outline" size="sm" onClick={() => session.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!session.data.authenticated) {
    return <TeamLogin hintName={session.data.hint?.display_name ?? null} />;
  }

  const { display_name } = session.data;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-6">
          <span className="font-display text-sm font-semibold text-foreground">
            Console do time
          </span>
          <nav className="flex items-center gap-1">
            <Link
              to="/team"
              search={{ view: "active", sort: "attention", offset: 0 }}
              activeOptions={{ exact: true }}
              activeProps={{ className: "active" }}
              className={NAV_LINK_CLASS}
            >
              Fila
            </Link>
            <Link
              to="/team/metrics"
              search={{ window: "14d" }}
              activeProps={{ className: "active" }}
              className={NAV_LINK_CLASS}
            >
              Métricas
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{display_name}</span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            {logout.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sair
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
