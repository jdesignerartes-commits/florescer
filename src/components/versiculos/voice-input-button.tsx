"use client";

import { useRef, useState } from "react";
import { Mic, Square, Check, X, TriangleAlert } from "lucide-react";

interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Status = "idle" | "recording" | "review";

export function VoiceInputButton({
  label = "Falar versículo",
  onConfirm,
}: {
  label?: string;
  onConfirm: (text: string, audioUrl: string | null) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor || !navigator.mediaDevices?.getUserMedia) {
      setUnsupported(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };
      recognition.onerror = () => setUnsupported(true);
      recognition.start();
      recognitionRef.current = recognition;

      setStatus("recording");
    } catch {
      // Permissão de microfone negada ou indisponível.
      setUnsupported(true);
    }
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("review");
  }

  function reset() {
    setStatus("idle");
    setTranscript("");
    setAudioUrl(null);
  }

  function confirm() {
    onConfirm(transcript, audioUrl);
    reset();
  }

  if (unsupported) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TriangleAlert className="size-3.5 shrink-0" />
        Reconhecimento de fala não disponível nesse navegador — digite
        manualmente.
      </p>
    );
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={startRecording}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Mic className="size-3.5" />
        {label}
      </button>
    );
  }

  if (status === "recording") {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
        <div className="flex items-center gap-2 text-xs text-destructive">
          <span className="size-2 animate-pulse rounded-full bg-destructive" />
          Gravando... fale à vontade
        </div>
        {transcript && (
          <p className="text-sm text-foreground">{transcript}</p>
        )}
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center justify-center gap-1.5 self-start rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Square className="size-3" />
          Parar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
      <p className="text-xs font-medium text-foreground">
        Revise antes de usar:
      </p>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {audioUrl && <audio controls src={audioUrl} className="h-8 w-full" />}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={!transcript.trim()}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          <Check className="size-3.5" />
          Usar este texto
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <X className="size-3.5" />
          Descartar
        </button>
      </div>
    </div>
  );
}
