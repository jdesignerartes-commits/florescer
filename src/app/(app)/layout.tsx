import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActivitiesProvider } from "@/lib/activities-context";
import { SettingsProvider } from "@/lib/settings-context";
import { VersesProvider } from "@/lib/verses-context";
import { HealthProvider } from "@/lib/health-context";
import { ExercisesProvider } from "@/lib/exercises-context";
import { createClient } from "@/lib/supabase/server";

// Redireciona pra /login só quando a sessão está confirmada ausente — um
// erro/timeout na checagem deixa passar (fail open) em vez de travar a
// pessoa fora do app por causa de uma falha de rede transitória.
//
// getUser() SEMPRE retorna um `error` quando não há sessão (AuthSessionMissingError,
// "Auth session missing!") — não é um sinal de falha, é como o Supabase
// avisa "deslogada". Só tratamos como falha ambígua (fail open) um erro
// DIFERENTE desse.
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const confirmedLoggedOut =
    !user && (!error || error.name === "AuthSessionMissingError");

  if (confirmedLoggedOut) redirect("/login");

  return (
    <SettingsProvider>
      <ActivitiesProvider>
        <VersesProvider>
          <HealthProvider>
            <ExercisesProvider>
              <AppShell>{children}</AppShell>
            </ExercisesProvider>
          </HealthProvider>
        </VersesProvider>
      </ActivitiesProvider>
    </SettingsProvider>
  );
}
