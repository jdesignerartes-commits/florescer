import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserSafe } from "@/lib/supabase/get-user-safe";

// Next.js 16 renomeou middleware.ts -> proxy.ts (mesma API, nome novo).
//
// Só atualiza o cookie de sessão do Supabase (efeito colateral de chamar
// getUser() com esse client) — quem decide se a rota exige login é o
// guard em (app)/layout.tsx, não aqui. Por isso SEMPRE deixa a requisição
// passar, não importa o resultado: uma chamada sem limite de tempo aqui já
// travou a navegação inteira por 25s+ quando a rede estava lenta (bug real
// que a Joyce sentiu), então usamos getUserSafe (timeout curto, nunca
// lança erro) e seguimos em frente de qualquer forma.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await getUserSafe(supabase);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
