"use client";

import Link from "next/link";
import { BookHeart } from "lucide-react";
import { useVerses } from "@/lib/verses-context";
import { type Verse } from "@/types/verse";

function verseOfTheDay(verses: Verse[]): Verse | null {
  if (verses.length === 0) return null;
  const favorites = verses.filter((v) => v.isFavorite);
  const pool = favorites.length > 0 ? favorites : verses;
  const dayIndex = Math.floor(Date.now() / 86400000);
  return pool[dayIndex % pool.length];
}

export function VerseOfTheDayCard() {
  const { verses } = useVerses();
  const verse = verseOfTheDay(verses);

  if (!verse) return null;

  return (
    <Link
      href="/versiculos"
      className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-sm ring-1 ring-foreground/[0.06] transition-shadow hover:shadow-md"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-terracota/15 text-terracota">
        <BookHeart className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Versículo de hoje
        </p>
        <p className="mt-0.5 truncate text-sm text-foreground italic">
          &ldquo;{verse.verseText}&rdquo;
        </p>
      </div>
    </Link>
  );
}
