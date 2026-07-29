"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, Plus } from "lucide-react";

export function RestTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      onDoneRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, running]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-marrom px-5 py-6 text-branco-quente">
      <p className="text-xs tracking-wide uppercase opacity-75">Descanso</p>
      <p className="text-4xl font-medium tabular-nums">{remaining}s</p>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pausar" : "Continuar"}
          className="flex size-9 items-center justify-center rounded-full bg-branco-quente/15"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button
          onClick={() => setRemaining((r) => r + 15)}
          aria-label="Adicionar 15 segundos"
          className="flex items-center gap-1 rounded-full bg-branco-quente/15 px-3 text-xs"
        >
          <Plus className="size-3.5" />
          15s
        </button>
        <button
          onClick={onDone}
          aria-label="Pular descanso"
          className="flex items-center gap-1 rounded-full bg-branco-quente/15 px-3 text-xs"
        >
          <SkipForward className="size-3.5" />
          Pular
        </button>
      </div>
    </div>
  );
}
