"use client";

import { createContext, useContext, useState } from "react";
import {
  type Verse,
  type VerseCollection,
  INITIAL_VERSES,
  INITIAL_COLLECTIONS,
} from "@/types/verse";

interface VersesContextValue {
  verses: Verse[];
  collections: VerseCollection[];
  addVerse: (verse: Verse) => void;
  updateVerse: (verse: Verse) => void;
  deleteVerse: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addCollection: (collection: VerseCollection) => void;
}

const VersesContext = createContext<VersesContextValue | null>(null);

export function VersesProvider({ children }: { children: React.ReactNode }) {
  const [verses, setVerses] = useState<Verse[]>(INITIAL_VERSES);
  const [collections, setCollections] =
    useState<VerseCollection[]>(INITIAL_COLLECTIONS);

  function addVerse(verse: Verse) {
    setVerses((prev) => [verse, ...prev]);
  }

  function updateVerse(verse: Verse) {
    setVerses((prev) => prev.map((v) => (v.id === verse.id ? verse : v)));
  }

  function deleteVerse(id: string) {
    setVerses((prev) => prev.filter((v) => v.id !== id));
  }

  function toggleFavorite(id: string) {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  }

  function addCollection(collection: VerseCollection) {
    setCollections((prev) => [...prev, collection]);
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
