"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    PinUtils?: { build: () => void };
  }
}

const PINIT_SRC = "https://assets.pinterest.com/js/pinit.js";

export function PinterestBoardEmbed({ boardUrl }: { boardUrl: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function build() {
      if (cancelled) return;
      window.PinUtils?.build();
    }

    if (window.PinUtils) {
      build();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PINIT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", build);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", build);
      };
    }

    const script = document.createElement("script");
    script.src = PINIT_SRC;
    script.async = true;
    script.onload = build;
    script.onerror = () => !cancelled && setFailed(true);
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [boardUrl]);

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        data-pin-do="embedBoard"
        data-pin-board-width="400"
        data-pin-scale-height="240"
        data-pin-scale-width="80"
        href={boardUrl}
      >
        Ver board no Pinterest
      </a>
      {failed && (
        <p className="text-sm text-muted-foreground">
          Não deu pra carregar o Pinterest agora.{" "}
          <a
            href={boardUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Abrir o board direto no Pinterest
          </a>
          .
        </p>
      )}
    </div>
  );
}
