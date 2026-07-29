"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(traduzErro(error.message));
        setLoading(false);
        return;
      }
      window.location.href = "/";
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setError(traduzErro(error.message));
      setLoading(false);
      return;
    }
    if (data.session) {
      window.location.href = "/";
      return;
    }
    setSignupDone(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-5 py-10">
      <div className="relative overflow-hidden rounded-2xl px-1 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-terracota/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 top-4 size-32 rounded-full bg-oliva/20 blur-3xl"
        />
        <div className="relative flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-heading text-2xl font-medium text-foreground">
            Florescer
          </span>
        </div>
        <p className="relative mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Que bom te ver de novo."
            : "Vamos criar sua conta."}
        </p>
      </div>

      <Card className="mt-5 rounded-2xl shadow-sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setSignupDone(false);
                }}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-sm font-medium transition-colors",
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {m === "signin" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {signupDone ? (
            <p className="rounded-lg bg-secondary/60 px-3 py-3 text-sm text-foreground">
              Quase lá — confirme seu e-mail (chegou um link de confirmação)
              e depois é só entrar.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como te chamamos?"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
              >
                {loading
                  ? "Um momento..."
                  : mode === "signin"
                    ? "Entrar"
                    : "Criar conta"}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function traduzErro(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (message.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar — verifique também a caixa de spam.";
  if (message.includes("User already registered"))
    return "Já existe uma conta com esse e-mail.";
  if (message.includes("Password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("rate limit"))
    return "Muitas tentativas em pouco tempo — espere um minuto e tente de novo.";
  return message;
}
