import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getStaffSession, SupportApiError, type StaffSession } from "@/lib/support-api";

export const STAFF_SESSION_KEY = ["support", "session"] as const;

/**
 * Guard de rota da UI: GET /web/support/auth/session.
 * 401 não é erro aqui — vira `{ authenticated: false, hint }` para a tela de
 * login mostrar o botão de 1 clique.
 */
export function useStaffSession() {
  return useQuery<StaffSession, SupportApiError>({
    queryKey: STAFF_SESSION_KEY,
    queryFn: getStaffSession,
    staleTime: 60_000,
    retry: (failureCount, error) =>
      error instanceof SupportApiError && error.kind === "network" && failureCount < 2,
  });
}

/**
 * Quando uma query da fachada falha com 401 (sessão morreu no servidor),
 * revalida a sessão — o layout /team troca para a tela de login sozinho.
 */
export function useSessionExpiredEffect(error: unknown) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (error instanceof SupportApiError && error.kind === "unauthorized") {
      void queryClient.invalidateQueries({ queryKey: STAFF_SESSION_KEY });
    }
  }, [error, queryClient]);
}
