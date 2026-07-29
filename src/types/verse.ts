export interface Verse {
  id: string;
  title: string;
  verseText: string;
  book: string;
  chapter: number | null;
  verseNumber: string;
  bibleVersion: string;
  reflection: string;
  isFavorite: boolean;
  audioUrl: string | null;
  transcriptionText: string;
  tags: string[];
  collectionIds: string[];
  createdAt: string;
}

export interface VerseCollection {
  id: string;
  name: string;
  description: string;
}

export type VerseSort = "recentes" | "antigos" | "alfabetica";

export const SUGGESTED_COLLECTIONS = [
  "Fé",
  "Coragem",
  "Ansiedade",
  "Gratidão",
  "Esperança",
  "Sabedoria",
  "Promessas",
  "Família",
  "Propósito",
  "Oração",
];
