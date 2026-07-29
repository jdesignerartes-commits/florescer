"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerseForm } from "@/components/versiculos/verse-form";
import { VerseCard } from "@/components/versiculos/verse-card";
import { useVerses } from "@/lib/verses-context";
import { type Verse, type VerseSort } from "@/types/verse";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<VerseSort, string> = {
  recentes: "Mais recentes",
  antigos: "Mais antigos",
  alfabetica: "Ordem alfabética",
};

function sortVerses(verses: Verse[], sort: VerseSort): Verse[] {
  const copy = [...verses];
  if (sort === "recentes")
    return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === "antigos")
    return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return copy.sort((a, b) => a.title.localeCompare(b.title));
}

export function VersesView() {
  const { verses, deleteVerse, toggleFavorite } = useVerses();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Verse | null>(null);
  const [query, setQuery] = useState("");
  const [bookFilter, setBookFilter] = useState<string>("todos");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<VerseSort>("recentes");

  const books = useMemo(
    () => Array.from(new Set(verses.map((v) => v.book).filter(Boolean))).sort(),
    [verses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = verses.filter((v) => {
      if (favoritesOnly && !v.isFavorite) return false;
      if (bookFilter !== "todos" && v.book !== bookFilter) return false;
      if (!q) return true;
      return (
        v.verseText.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.book.toLowerCase().includes(q) ||
        v.tags.some((t) => t.includes(q))
      );
    });
    return sortVerses(matches, sort);
  }, [verses, query, bookFilter, favoritesOnly, sort]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(verse: Verse) {
    setEditing(verse);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-6 md:py-10">
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
              Versículos de Ouro
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua coleção espiritual pessoal.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Novo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por texto, referência ou palavra-chave..."
            className="w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              favoritesOnly
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("size-3.5", favoritesOnly && "fill-current")} />
            Favoritos
          </button>

          {books.length > 0 && (
            <Select value={bookFilter} onValueChange={(v) => setBookFilter(v as string)}>
              <SelectTrigger size="sm">
                <SelectValue>
                  {(v: string) => (v === "todos" ? "Todos os livros" : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os livros</SelectItem>
                {books.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sort} onValueChange={(v) => setSort(v as VerseSort)}>
            <SelectTrigger size="sm">
              <SelectValue>{(v: VerseSort) => SORT_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as VerseSort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-marinho px-5 py-8 text-center text-branco-quente">
          <span aria-hidden className="text-4xl">
            📖
          </span>
          <p className="mt-2 text-sm">
            {verses.length === 0
              ? "Sua coleção está vazia. Que tal guardar o primeiro versículo?"
              : "Nada encontrado com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((verse) => (
            <VerseCard
              key={verse.id}
              verse={verse}
              onEdit={() => openEdit(verse)}
              onDelete={() => deleteVerse(verse.id)}
              onToggleFavorite={() => toggleFavorite(verse.id)}
            />
          ))}
        </div>
      )}

      <VerseForm open={formOpen} onOpenChange={setFormOpen} verse={editing} />
    </div>
  );
}
