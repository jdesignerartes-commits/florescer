"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Verse, type VerseCollection, SUGGESTED_COLLECTIONS } from "@/types/verse";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type AsyncStatus = "loading" | "ready" | "error";

type VerseRow = Database["public"]["Tables"]["golden_verses"]["Row"];
type CollectionRow = Database["public"]["Tables"]["verse_collections"]["Row"];

interface VersesContextValue {
  verses: Verse[];
  collections: VerseCollection[];
  addVerse: (verse: Verse) => void;
  updateVerse: (verse: Verse) => void;
  deleteVerse: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addCollection: (collection: VerseCollection) => void;
  status: AsyncStatus;
  error: string | null;
}

const VersesContext = createContext<VersesContextValue | null>(null);

function fromCollectionRow(row: CollectionRow): VerseCollection {
  return { id: row.id, name: row.name, description: row.description ?? "" };
}

function fromVerseRow(row: VerseRow, tags: string[], collectionIds: string[]): Verse {
  return {
    id: row.id,
    title: row.title,
    verseText: row.verse_text,
    book: row.book,
    chapter: row.chapter,
    verseNumber: row.verse_number ?? "",
    bibleVersion: row.bible_version ?? "",
    reflection: row.reflection ?? "",
    isFavorite: row.is_favorite,
    audioUrl: row.audio_url,
    transcriptionText: row.transcription_text ?? "",
    tags,
    collectionIds,
    createdAt: row.created_at,
  };
}

function toVerseRow(
  verse: Verse,
  userId: string
): Database["public"]["Tables"]["golden_verses"]["Insert"] {
  return {
    id: verse.id,
    user_id: userId,
    title: verse.title,
    verse_text: verse.verseText,
    book: verse.book,
    chapter: verse.chapter,
    verse_number: verse.verseNumber || null,
    bible_version: verse.bibleVersion || null,
    reflection: verse.reflection || null,
    is_favorite: verse.isFavorite,
    audio_url: verse.audioUrl,
    transcription_text: verse.transcriptionText || null,
  };
}

export function VersesProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [collections, setCollections] = useState<VerseCollection[]>([]);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const [
          { data: verseRows, error: verseErr },
          { data: collectionRows, error: collectionErr },
          { data: tagRows, error: tagErr },
          { data: tagRelRows, error: tagRelErr },
          { data: collectionItemRows, error: collectionItemErr },
        ] = await Promise.all([
          supabase.from("golden_verses").select("*"),
          supabase.from("verse_collections").select("*"),
          supabase.from("verse_tags").select("id, name"),
          supabase.from("verse_tag_relations").select("verse_id, tag_id"),
          supabase.from("verse_collection_items").select("verse_id, collection_id"),
        ]);
        if (verseErr) throw verseErr;
        if (collectionErr) throw collectionErr;
        if (tagErr) throw tagErr;
        if (tagRelErr) throw tagRelErr;
        if (collectionItemErr) throw collectionItemErr;
        if (cancelled) return;

        const tagNameById = new Map((tagRows ?? []).map((t) => [t.id, t.name]));
        const tagsByVerse = new Map<string, string[]>();
        for (const rel of tagRelRows ?? []) {
          const name = tagNameById.get(rel.tag_id);
          if (!name) continue;
          const list = tagsByVerse.get(rel.verse_id) ?? [];
          list.push(name);
          tagsByVerse.set(rel.verse_id, list);
        }
        const collectionIdsByVerse = new Map<string, string[]>();
        for (const item of collectionItemRows ?? []) {
          const list = collectionIdsByVerse.get(item.verse_id) ?? [];
          list.push(item.collection_id);
          collectionIdsByVerse.set(item.verse_id, list);
        }

        let collectionsToUse = (collectionRows ?? []).map(fromCollectionRow);
        if (collectionsToUse.length === 0) {
          const { data: seeded, error: seedErr } = await supabase
            .from("verse_collections")
            .insert(SUGGESTED_COLLECTIONS.map((name) => ({ user_id: userId, name })))
            .select("*");
          if (seedErr) throw seedErr;
          collectionsToUse = (seeded ?? []).map(fromCollectionRow);
        }
        if (cancelled) return;

        setCollections(collectionsToUse);
        setVerses(
          (verseRows ?? []).map((row) =>
            fromVerseRow(
              row,
              tagsByVerse.get(row.id) ?? [],
              collectionIdsByVerse.get(row.id) ?? []
            )
          )
        );
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erro ao carregar os versículos.");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  async function getOrCreateTagIds(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const { data, error: err } = await supabase
      .from("verse_tags")
      .upsert(
        names.map((name) => ({ user_id: userId, name })),
        { onConflict: "user_id,name" }
      )
      .select("id");
    if (err) throw err;
    return (data ?? []).map((r) => r.id);
  }

  async function syncVerseRelations(verseId: string, tags: string[], collectionIds: string[]) {
    const [{ error: delTagErr }, { error: delCollErr }] = await Promise.all([
      supabase.from("verse_tag_relations").delete().eq("verse_id", verseId),
      supabase.from("verse_collection_items").delete().eq("verse_id", verseId),
    ]);
    if (delTagErr) throw delTagErr;
    if (delCollErr) throw delCollErr;

    const tagIds = await getOrCreateTagIds(tags);
    const inserts = [];
    if (tagIds.length > 0) {
      inserts.push(
        supabase
          .from("verse_tag_relations")
          .insert(tagIds.map((tag_id) => ({ verse_id: verseId, tag_id })))
      );
    }
    if (collectionIds.length > 0) {
      inserts.push(
        supabase
          .from("verse_collection_items")
          .insert(collectionIds.map((collection_id) => ({ verse_id: verseId, collection_id })))
      );
    }
    const results = await Promise.all(inserts);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  }

  async function addVerse(verse: Verse) {
    setVerses((prev) => [verse, ...prev]);
    try {
      const { error: err } = await supabase.from("golden_verses").insert(toVerseRow(verse, userId));
      if (err) throw err;
      await syncVerseRelations(verse.id, verse.tags, verse.collectionIds);
    } catch (e) {
      setVerses((prev) => prev.filter((v) => v.id !== verse.id));
      setError(e instanceof Error ? e.message : "Erro ao salvar o versículo.");
    }
  }

  async function updateVerse(verse: Verse) {
    const previous = verses;
    setVerses((prev) => prev.map((v) => (v.id === verse.id ? verse : v)));
    try {
      const { error: err } = await supabase
        .from("golden_verses")
        .update(toVerseRow(verse, userId))
        .eq("id", verse.id);
      if (err) throw err;
      await syncVerseRelations(verse.id, verse.tags, verse.collectionIds);
    } catch (e) {
      setVerses(previous);
      setError(e instanceof Error ? e.message : "Erro ao salvar o versículo.");
    }
  }

  async function deleteVerse(id: string) {
    const previous = verses;
    setVerses((prev) => prev.filter((v) => v.id !== id));
    const { error: err } = await supabase.from("golden_verses").delete().eq("id", id);
    if (err) {
      setVerses(previous);
      setError(err.message);
    }
  }

  async function toggleFavorite(id: string) {
    const previous = verses;
    const verse = verses.find((v) => v.id === id);
    if (!verse) return;
    const nextFavorite = !verse.isFavorite;
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: nextFavorite } : v))
    );
    const { error: err } = await supabase
      .from("golden_verses")
      .update({ is_favorite: nextFavorite })
      .eq("id", id);
    if (err) {
      setVerses(previous);
      setError(err.message);
    }
  }

  async function addCollection(collection: VerseCollection) {
    setCollections((prev) => [...prev, collection]);
    const { error: err } = await supabase.from("verse_collections").insert({
      id: collection.id,
      user_id: userId,
      name: collection.name,
      description: collection.description || null,
    });
    if (err) {
      setCollections((prev) => prev.filter((c) => c.id !== collection.id));
      setError(err.message);
    }
  }

  return (
    <VersesContext.Provider
      value={{
        verses,
        collections,
        addVerse,
        updateVerse,
        deleteVerse,
        toggleFavorite,
        addCollection,
        status,
        error,
      }}
    >
      {children}
    </VersesContext.Provider>
  );
}

export function useVerses() {
  const ctx = useContext(VersesContext);
  if (!ctx) throw new Error("useVerses must be used within VersesProvider");
  return ctx;
}
