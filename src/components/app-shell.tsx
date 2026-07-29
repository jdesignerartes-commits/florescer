"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, primaryNavItems, isNavItemActive } from "@/lib/nav";
import { MoreMenu } from "@/components/more-menu";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = navGroups
    .flatMap((g) => g.items)
    .filter((i) => !i.primary)
    .some((i) => isNavItemActive(pathname, i.href));

  return (
    <div className="min-h-full md:flex">
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:gap-5 md:overflow-y-auto md:border-r md:border-sidebar-border md:bg-sidebar md:p-4">
        <div className="flex items-center gap-2 px-2 pt-1">
          <span className="font-heading text-lg font-medium text-sidebar-foreground">
            Florescer
          </span>
        </div>
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 text-[11px] font-medium tracking-wide text-sidebar-foreground/45 uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-[18px]",
                      active ? "text-sidebar-primary" : "text-current"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </aside>

      <div className="flex min-h-full flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-5 py-3.5 md:hidden">
          <span className="font-heading text-base font-medium">Florescer</span>
        </header>

        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        <nav className="fixed inset-x-4 bottom-5 z-10 flex items-center justify-between rounded-3xl bg-marinho px-2 py-2 shadow-lg shadow-marinho/30 md:hidden">
          {primaryNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[10.5px] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-branco-quente/60 active:text-branco-quente"
                )}
              >
                <item.icon className="size-5" />
                <span className="leading-none whitespace-nowrap">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[10.5px] transition-colors",
              moreActive
                ? "bg-primary text-primary-foreground"
                : "text-branco-quente/60 active:text-branco-quente"
            )}
          >
            <MoreHorizontal className="size-5" />
            <span className="leading-none">Mais</span>
          </button>
        </nav>

        <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
      </div>
    </div>
  );
}
