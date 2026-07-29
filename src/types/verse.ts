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

function makeCollection(name: string): VerseCollection {
  return { id: crypto.randomUUID(), name, description: "" };
}

export const INITIAL_COLLECTIONS: VerseCollection[] =
  SUGGESTED_COLLECTIONS.map(makeCollection);

function collectionId(name: string) {
  return INITIAL_COLLECTIONS.find((c) => c.name === name)!.id;
}

export const INITIAL_VERSES: Verse[] = [
  {
    id: crypto.randomUUID(),
    title: "Não tenha medo",
    verseText:
      "Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore, nem se desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.",
    book: "Josué",
    chapter: 1,
    verseNumber: "9",
    bibleVersion: "NVI",
    reflection: "Lembrar que não preciso enfrentar tudo sozinha.",
    isFavorite: true,
    audioUrl: null,
    transcriptionText: "",
    tags: ["coragem"],
    collectionIds: [collectionId("Coragem")],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Força em Deus",
    verseText: "Tudo posso naquele que me fortalece.",
    book: "Filipenses",
    chapter: 4,
    verseNumber: "13",
    bibleVersion: "ARC",
    reflection: "",
    isFavorite: false,
    audioUrl: null,
    transcriptionText: "",
    tags: ["fé"],
    collectionIds: [collectionId("Fé")],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "O Senhor é meu pastor",
    verseText: "O Senhor é o meu pastor; de nada terei falta.",
    book: "Salmos",
    chapter: 23,
    verseNumber: "1",
    bibleVersion: "NVI",
    reflection: "Descansar sabendo que sou cuidada.",
    isFavorite: true,
    audioUrl: null,
    transcriptionText: "",
    tags: ["esperança", "gratidão"],
    collectionIds: [collectionId("Esperança"), collectionId("Gratidão")],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Confiar no tempo certo",
    verseText:
      "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
    book: "Provérbios",
    chapter: 3,
    verseNumber: "5",
    bibleVersion: "NVI",
    reflection: "",
    isFavorite: false,
    audioUrl: null,
    transcriptionText: "",
    tags: ["sabedoria"],
    collectionIds: [collectionId("Sabedoria")],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
