"use client";

import { ExternalLink } from "lucide-react";
import { PinterestBoardEmbed } from "@/components/pinterest/pinterest-board-embed";

const BOARD_URL = "https://br.pinterest.com/joyceslisboa/moda-e-estilo/";

export function EstiloView() {
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
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              Moda e Estilo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Seu board de inspiração do Pinterest.
            </p>
          </div>
          <a
            href={BOARD_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir no Pinterest"
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-foreground/[0.06] hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
        <PinterestBoardEmbed boardUrl={BOARD_URL} />
      </div>
    </div>
  );
}
