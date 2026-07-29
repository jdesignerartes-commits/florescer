import type { SupabaseClient, AuthError } from "@supabase/supabase-js";

export interface SafeUserResult {
  user: Awaited<ReturnType<SupabaseClient["auth"]["getUser"]>>["data"]["user"];
  error: AuthError | null;
  timedOut: boolean;
}

const RETRYABLE_ERROR_NAME = "AuthRetryableFetchError";
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 200;

/**
 * Wrapper em volta de supabase.auth.getUser() com limite de tempo total e
 * uma tentativa extra especificamente pra AuthRetryableFetchError (falha
 * de rede transitória — o próprio nome do erro já sinaliza que é seguro
 * tentar de novo; vimos isso acontecer de verdade nesse ambiente de dev).
 * Nunca lança erro, nunca passa do timeout total, não importa quantas
 * tentativas rodem.
 */
export async function getUserSafe(
  supabase: SupabaseClient,
  timeoutMs = 3000
): Promise<SafeUserResult> {
  const deadline = Date.now() + timeoutMs;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return { user: null, error: null, timedOut: true };

    const timeout = new Promise<{ timedOut: true }>((resolve) =>
      setTimeout(() => resolve({ timedOut: true }), remaining)
    );

    try {
      const result = await Promise.race([
        supabase.auth.getUser().then((r) => ({ ...r, timedOut: false as const })),
        timeout,
      ]);

      if (result.timedOut) return { user: null, error: null, timedOut: true };

      const canRetry =
        result.error?.name === RETRYABLE_ERROR_NAME &&
        attempt < MAX_ATTEMPTS &&
        Date.now() + RETRY_DELAY_MS < deadline;
      if (canRetry) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }

      return { user: result.data.user, error: result.error, timedOut: false };
    } catch {
      return { user: null, error: null, timedOut: false };
    }
  }

  return { user: null, error: null, timedOut: true };
}
