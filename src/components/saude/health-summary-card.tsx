"use client";

import Link from "next/link";
import { HeartPulse, Plus } from "lucide-react";
import { useHealth } from "@/lib/health-context";

export function HealthSummaryCard() {
  const { latest } = useHealth();

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-sm ring-1 ring-foreground/[0.06]">
      <Link href="/saude" className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-marigold/15 text-marigold">
          <HeartPulse className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Minha saúde
          </p>
          {latest ? (
            <p className="mt-0.5 text-sm text-foreground">
              {latest.systolic}/{latest.diastolic} mmHg
              <span className="text-muted-foreground"> · {latest.measurementTime}</span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Nenhuma medição ainda
            </p>
          )}
        </div>
      </Link>
      <Link
        href="/saude"
        aria-label="Adicionar medição"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
      >
        <Plus className="size-4" />
      </Link>
    </div>
  );
}
