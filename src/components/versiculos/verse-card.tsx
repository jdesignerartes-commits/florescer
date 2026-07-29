"use client";

import { useState } from "react";
import { Heart, Pencil, Share2, Trash2, Check, X } from "lucide-react";
import { type Verse } from "@/types/verse";
import { cn } from "@/lib/utils";

function reference(verse: Verse) {
  const parts = [verse.book, verse.chapter, verse.verseNumber]
    .filter((p) => p !== null && p !== "")
    .join(verse.chapter && verse.verseNumber ? ":" : " ");
  return verse.bibleVersion ? `${parts} (${verse.bibleVersion})` : parts;
}

export function VerseCard({
  verse,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  verse: Verse;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleShare() {
    const text = `${verse.verseText}\n— ${reference(verse)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: verse.title, text });
      } catch {
        // usuária cancelou o compartilhamento — sem problema.
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/[0.06]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-medium text-foreground">
          {verse.title}
        </h3>
        <button
          onClick={onToggleFavorite}
          aria-label={verse.isFavorite ? "Remover dos favoritos" : "Favoritar"}
          className="shrink-0 text-terracota"
        >
          <Heart className={cn("size-4", verse.isFavorite && "fill-terracota")} />
        </button>
      </div>

      <p className="text-sm leading-relaxed text-foreground italic">
        &ldquo;{verse.verseText}&rdquo;
      </p>
      <p className="text-xs font-medium text-muted-foreground">
        {reference(verse)}
      </p>

      {verse.reflection && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
          {verse.reflection}
        </p>
      )}

      {verse.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {verse.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center gap-1 border-t border-border pt-3">
        {confirmingDelete ? (
          <>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-xs text-destructive"
            >
              <Check className="size-3.5" />
              Confirmar
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              <X className="size-3.5" />
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              aria-label="Editar"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-muted hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={handleShare}
              aria-label="Compartilhar"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-muted hover:text-foreground"
            >
              <Share2 className="size-3.5" />
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label="Excluir"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
