"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInputButton } from "@/components/versiculos/voice-input-button";
import { useVerses } from "@/lib/verses-context";
import { type Verse } from "@/types/verse";
import { cn } from "@/lib/utils";

function emptyVerse(): Verse {
  return {
    id: crypto.randomUUID(),
    title: "",
    verseText: "",
    book: "",
    chapter: null,
    verseNumber: "",
    bibleVersion: "",
    reflection: "",
    isFavorite: false,
    audioUrl: null,
    transcriptionText: "",
    tags: [],
    collectionIds: [],
    createdAt: new Date().toISOString(),
  };
}

export function VerseForm({
  open,
  onOpenChange,
  verse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verse: Verse | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent key={verse?.id ?? "new"} className="flex flex-col overflow-y-auto">
        <VerseFormBody
          initial={verse ?? emptyVerse()}
          isEditing={verse !== null}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function VerseFormBody({
  initial,
  isEditing,
  onDone,
}: {
  initial: Verse;
  isEditing: boolean;
  onDone: () => void;
}) {
  const { collections, addVerse, updateVerse } = useVerses();
  const [form, setForm] = useState<Verse>(initial);
  const [tagInput, setTagInput] = useState("");

  function update<K extends keyof Verse>(key: K, value: Verse[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      update("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update(
      "tags",
      form.tags.filter((t) => t !== tag)
    );
  }

  function toggleCollection(id: string) {
    setForm((prev) => ({
      ...prev,
      collectionIds: prev.collectionIds.includes(id)
        ? prev.collectionIds.filter((c) => c !== id)
        : [...prev.collectionIds, id],
    }));
  }

  const canSave = form.title.trim().length > 0 && form.verseText.trim().length > 0;

  function handleSave() {
    if (isEditing) updateVerse(form);
    else addVerse(form);
    onDone();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isEditing ? "Editar versículo" : "Novo versículo"}</SheetTitle>
        <SheetDescription>
          Digite ou fale — dá pra revisar antes de salvar.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verse-title">Título pessoal</Label>
          <Input
            id="verse-title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ex: Não tenha medo"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verse-text">Texto do versículo</Label>
          <Textarea
            id="verse-text"
            value={form.verseText}
            onChange={(e) => update("verseText", e.target.value)}
            placeholder="Escreva o versículo..."
            rows={3}
          />
          <VoiceInputButton
            label="Falar versículo"
            onConfirm={(text, audioUrl) => {
              update("verseText", form.verseText ? `${form.verseText} ${text}` : text);
              if (audioUrl) update("audioUrl", audioUrl);
              update("transcriptionText", text);
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="verse-book">Livro</Label>
            <Input
              id="verse-book"
              value={form.book}
              onChange={(e) => update("book", e.target.value)}
              placeholder="Ex: Josué"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verse-chapter">Cap.</Label>
            <Input
              id="verse-chapter"
              type="number"
              min={1}
              value={form.chapter ?? ""}
              onChange={(e) =>
                update("chapter", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verse-number">Versículo</Label>
            <Input
              id="verse-number"
              value={form.verseNumber}
              onChange={(e) => update("verseNumber", e.target.value)}
              placeholder="Ex: 9 ou 16-17"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verse-version">Versão</Label>
            <Input
              id="verse-version"
              value={form.bibleVersion}
              onChange={(e) => update("bibleVersion", e.target.value)}
              placeholder="Ex: NVI"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verse-reflection">Reflexão</Label>
          <Textarea
            id="verse-reflection"
            value={form.reflection}
            onChange={(e) => update("reflection", e.target.value)}
            placeholder="Opcional — o que esse versículo significa pra você?"
            rows={3}
          />
          <VoiceInputButton
            label="Falar reflexão"
            onConfirm={(text, audioUrl) => {
              update(
                "reflection",
                form.reflection ? `${form.reflection} ${text}` : text
              );
              if (audioUrl && !form.audioUrl) update("audioUrl", audioUrl);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verse-tags">Palavras-chave</Label>
          <div className="flex gap-2">
            <Input
              id="verse-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ex: paz — Enter pra adicionar"
            />
          </div>
          {form.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Coleções</Label>
          <div className="flex flex-wrap gap-1.5">
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCollection(c.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  form.collectionIds.includes(c.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row">
        <SheetClose
          className="flex-1"
          render={<Button variant="outline" className="w-full" />}
        >
          Cancelar
        </SheetClose>
        <Button className="flex-1" disabled={!canSave} onClick={handleSave}>
          Salvar
        </Button>
      </SheetFooter>
    </>
  );
}
