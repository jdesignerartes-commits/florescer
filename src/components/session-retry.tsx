"use client";

import { useEffect } from "react";

// Tenta de novo sozinho uma vez (falha de rede transitória costuma passar
// rápido) e sempre dá a opção de tentar na mão.
export function SessionRetry() {
  useEffect(() => {
    const id = setTimeout(() => window.location.reload(), 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
    >
      Tentar de novo
    </button>
  );
}
