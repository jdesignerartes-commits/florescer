import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActivitiesProvider } from "@/lib/activities-context";
import { DayEntryProvider } from "@/lib/day-entry-context";
import { SettingsProvider } from "@/lib/settings-context";
import { VersesProvider } from "@/lib/verses-context";
import { HealthProvider } from "@/lib/health-context";
import { ExercisesProvider } from "@/lib/exercises-context";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/get-user-safe";
import { SessionRetry } from "@/components/session-retry";

// Nunca deixa o Next.js cachear/dedupar esse fetch de auth — em teste local
// (Turbopack dev) o fetch interno do Supabase SDK estava falhando de forma
// consistente sem isso.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Redireciona pra /login só quando a sessão está confirmada ausente — um
// erro/timeout na checagem deixa passar (fail open) em vez de travar a
// pessoa fora do app por causa de uma falha de rede transitória.
//
// getUser() SEMPRE retorna um `error` quando não há sessão (AuthSessionMissingError,
// "Auth session missing!") — não é um sinal de falha, é como o Supabase
// avisa "deslogada". Só tratamos como falha ambígua (fail open) um erro
// DIFERENTE desse. Usa getUserSafe (não getUser direto) porque essa chamada
// de rede real já falhou de forma transitória (AuthRetryableFetchError) em
// teste local — o helper tenta de novo uma vez antes de desistir.
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { user, error } = await getUserSafe(supabase);

  const confirmedLoggedOut =
    !user && (!error || error.name === "AuthSessionMissingError");

  if (confirmedLoggedOut) redirect("/login");

  // Chegou aqui sem redirecionar mas ainda sem usuário: erro ambíguo (não
  // confirmou nem sessão válida, nem ausente). Não força pra fora do app,
  // mas também não dá pra montar os providers sem um id de usuário real.
  if (!user) {
    return (
      <div className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-sm text-muted-foreground">
          Não deu pra confirmar sua sessão agora.
        </p>
        <SessionRetry />
      </div>
    );
  }

  return (
    <SettingsProvider userId={user.id}>
      <ActivitiesProvider userId={user.id}>
        <DayEntryProvider userId={user.id}>
          <VersesProvider>
            <HealthProvider>
              <ExercisesProvider>
                <AppShell>{children}</AppShell>
              </ExercisesProvider>
            </HealthProvider>
          </VersesProvider>
        </DayEntryProvider>
      </ActivitiesProvider>
    </SettingsProvider>
  );
}
