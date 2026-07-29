import { AppShell } from "@/components/app-shell";
import { ActivitiesProvider } from "@/lib/activities-context";
import { SettingsProvider } from "@/lib/settings-context";
import { VersesProvider } from "@/lib/verses-context";
import { HealthProvider } from "@/lib/health-context";
import { ExercisesProvider } from "@/lib/exercises-context";

// Login existe (src/app/login) mas não está sendo exigido por enquanto —
// voltamos a travar essas rotas quando retomarmos a autenticação.
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
