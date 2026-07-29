"use client";

import { Sun, Moon, Bell, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings, type Theme } from "@/lib/settings-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const GOAL_PRESETS = [50, 100, 150, 200];

export function ConfiguracoesView() {
  const { name, setName, dailyGoalPoints, setDailyGoalPoints, theme, setTheme } =
    useSettings();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl px-1 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-terracota/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 top-4 size-32 rounded-full bg-oliva/20 blur-3xl"
        />
        <h1 className="relative font-heading text-3xl font-medium text-foreground">
          Configurações
        </h1>
        <p className="relative mt-1 text-sm text-muted-foreground">
          Suas preferências.
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Como te chamamos?</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="settings-name" className="sr-only">
            Nome
          </Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Meta diária de pontos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Só um norte, não uma cobrança — passar ou ficar abaixo dela não
            muda nada além do número na barra de progresso.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDailyGoalPoints(p)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  dailyGoalPoints === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Input
            type="number"
            min={5}
            step={5}
            value={dailyGoalPoints}
            onChange={(e) => setDailyGoalPoints(Number(e.target.value) || 0)}
            className="w-28"
            aria-label="Meta diária de pontos personalizada"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(
              [
                { value: "light" as Theme, label: "Claro", icon: Sun },
                { value: "dark" as Theme, label: "Escuro", icon: Moon },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors",
                  theme === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <opt.icon className="size-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Lembretes gentis dos seus hábitos — em breve.
          </p>
        </CardContent>
      </Card>

      <button
        type="button"
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
      >
        <LogOut className="size-4" />
        Sair da conta
      </button>
    </div>
  );
}
