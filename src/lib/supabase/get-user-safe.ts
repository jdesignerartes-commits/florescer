import type { SupabaseClient } from "@supabase/supabase-js";

export type SafeUserResult =
  | { user: NonNullable<Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"]>; timedOut: false }
  | { user: null; timedOut: boolean };

/**
 * Wrapper em volta de supabase.auth.getUser() com um limite de tempo —
 * nunca lança erro, nunca demora além do timeout. Existe porque uma
 * chamada sem limite aqui já travou a navegação inteira por 25s+ quando
 * a rede estava lenta (ver proxy.ts).
 */
export async function getUserSafe(
  supabase: SupabaseClient,
  timeoutMs = 2500
): Promise<SafeUserResult> {
  const timeout = new Promise<{ timedOut: true }>((resolve) =>
    setTimeout(() => resolve({ timedOut: true }), timeoutMs)
  );

  try {
    const result = await Promise.race([
      supabase.auth.getUser().then((r) => ({ ...r, timedOut: false as const })),
      timeout,
    ]);

    if (result.timedOut) return { user: null, timedOut: true };
    return { user: result.data.user, timedOut: false };
  } catch {
    return { user: null, timedOut: false };
  }
}
