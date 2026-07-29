import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renomeou middleware.ts -> proxy.ts (mesma API, nome novo).
//
// Login está desligado por pedido da Joyce (ver (app)/layout.tsx) — nenhuma
// rota depende de sessão agora. Chegou a existir aqui uma chamada de
// `supabase.auth.getUser()` pra manter o cookie de sessão atualizado, mas
// como nada usa sessão no momento, ela só adicionava uma chamada de rede
// síncrona em toda navegação — e quando essa chamada demorava ou falhava,
// a navegação inteira travava (25s+ por clique, bug real que a Joyce
// sentiu). Removida até o login voltar; reintroduzir junto com o guard de
// rota em (app)/layout.tsx.
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
