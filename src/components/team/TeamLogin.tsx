// Login OTP do console do time (/team sem sessão).
// Ritual diário alvo: ~10 segundos — 1 clique ("Entrar como <nome>"),
// ler o código no WhatsApp, 6 teclas (auto-submit no sexto dígito).

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { STAFF_SESSION_KEY } from "@/hooks/useStaffSession";
import {
  confirmStaffAuth,
  staffLogout,
  startStaffAuth,
  SupportApiError,
  type AuthStartResponse,
} from "@/lib/support-api";
import { normalizePhoneInput, PHONE_RE } from "@/lib/support-format";

type Challenge = {
  id: string;
  /** presente apenas quando o operador digitou o telefone (primeiro acesso) */
  phone?: string;
  retryAfterSeconds: number;
};

function useCountdown(seconds: number, resetKey: string) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setLeft((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(timer);
    // resetKey força reinício quando um novo código é enviado
  }, [seconds, resetKey]);
  return left;
}

function errorMessage(error: unknown): string {
  if (error instanceof SupportApiError) {
    switch (error.kind) {
      case "invalid":
        return error.options.code === "invalid_phone"
          ? "Telefone inválido. Use o formato +5511999999999."
          : "Código inválido ou expirado. Peça um novo código se necessário.";
      case "rate_limit":
        return error.options.retryAfterSeconds
          ? `Muitas tentativas. Aguarde ${error.options.retryAfterSeconds}s e tente de novo.`
          : "Muitas tentativas. Aguarde um pouco e tente de novo.";
      case "network":
        return "Falha de rede. Verifique a conexão e tente novamente.";
      case "storage":
        return "Banco de dados indisponível. Tente novamente em instantes.";
      default:
        return "Não foi possível concluir agora. Tente novamente.";
    }
  }
  return "Não foi possível concluir agora. Tente novamente.";
}

export function TeamLogin({ hintName }: { hintName: string | null }) {
  const queryClient = useQueryClient();
  const [usePhoneInput, setUsePhoneInput] = useState(!hintName);
  const [phoneRaw, setPhoneRaw] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const submittedCode = useRef<string | null>(null);

  const resendLeft = useCountdown(challenge?.retryAfterSeconds ?? 0, challenge?.id ?? "");

  const start = useMutation({
    mutationFn: ({ phone }: { phone?: string }) => startStaffAuth(phone),
    onSuccess: (data: AuthStartResponse, vars) => {
      setChallenge({
        id: data.challenge_id,
        phone: vars.phone,
        retryAfterSeconds: data.retry_after_seconds,
      });
      setCode("");
      submittedCode.current = null;
      setMessage(null);
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const confirm = useMutation({
    mutationFn: (input: { challenge_id: string; code: string; phone?: string }) =>
      confirmStaffAuth(input),
    onSuccess: (data) => {
      queryClient.setQueryData(STAFF_SESSION_KEY, {
        authenticated: true as const,
        display_name: data.display_name,
        expires_at: data.expires_at,
      });
      void queryClient.invalidateQueries({ queryKey: ["support"] });
    },
    onError: (error) => {
      setMessage(errorMessage(error));
      setCode("");
      submittedCode.current = null;
    },
  });

  const forget = useMutation({
    mutationFn: () => staffLogout(true),
    onSettled: () => {
      setUsePhoneInput(true);
      setChallenge(null);
      setCode("");
      void queryClient.invalidateQueries({ queryKey: STAFF_SESSION_KEY });
    },
  });

  function handleStartWithPhone(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizePhoneInput(phoneRaw);
    if (!PHONE_RE.test(phone)) {
      setMessage("Telefone inválido. Use o formato +5511999999999.");
      return;
    }
    start.mutate({ phone });
  }

  function handleCodeChange(value: string) {
    setCode(value);
    setMessage(null);
    // Auto-submit no sexto dígito (também cobre colar o código inteiro).
    if (value.length === 6 && challenge && !confirm.isPending && submittedCode.current !== value) {
      submittedCode.current = value;
      confirm.mutate({ challenge_id: challenge.id, code: value, phone: challenge.phone });
    }
  }

  function handleResend() {
    if (!challenge || resendLeft > 0 || start.isPending) return;
    start.mutate({ phone: challenge.phone });
  }

  function backToStart() {
    setChallenge(null);
    setCode("");
    setMessage(null);
    setUsePhoneInput(true);
  }

  const busy = start.isPending || confirm.isPending;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle className="font-display text-lg">Console do time</CardTitle>
          <CardDescription>
            {challenge
              ? "Digite o código de 6 dígitos enviado no seu WhatsApp."
              : "Acesso restrito à equipe de suporte. O código chega no seu WhatsApp."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!challenge && !usePhoneInput && hintName && (
            <Button className="w-full" size="lg" disabled={busy} onClick={() => start.mutate({})}>
              {start.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Entrar como {hintName}
            </Button>
          )}

          {!challenge && usePhoneInput && (
            <form className="space-y-3" onSubmit={handleStartWithPhone}>
              <div className="space-y-1.5">
                <Label htmlFor="staff-phone">Telefone (WhatsApp)</Label>
                <Input
                  id="staff-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+5511999999999"
                  value={phoneRaw}
                  onChange={(e) => {
                    setPhoneRaw(e.target.value);
                    setMessage(null);
                  }}
                  disabled={busy}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy || !phoneRaw.trim()}>
                {start.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Receber código
              </Button>
            </form>
          )}

          {challenge && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  disabled={confirm.isPending}
                  autoFocus
                  aria-label="Código de verificação de 6 dígitos"
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} className="h-11 w-11 text-base" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {confirm.isPending && (
                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Verificando…
                </p>
              )}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={resendLeft > 0 || start.isPending}
                  onClick={handleResend}
                >
                  {resendLeft > 0 ? `Reenviar código (${resendLeft}s)` : "Reenviar código"}
                </Button>
              </div>
            </div>
          )}

          {message && (
            <p role="alert" className="text-center text-sm text-destructive">
              {message}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-1.5 text-center">
          {challenge ? (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={backToStart}
            >
              Entrar com outro número
            </button>
          ) : (
            hintName &&
            !usePhoneInput && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => setUsePhoneInput(true)}
              >
                Entrar com outro número
              </button>
            )
          )}
          {hintName && (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              disabled={forget.isPending}
              onClick={() => forget.mutate()}
            >
              Esquecer este dispositivo
            </button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
