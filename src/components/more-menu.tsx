"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { secondaryNavItems, isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MoreMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80svh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Mais</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto px-4 pb-6">
          {secondaryNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-xs transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="size-5" />
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
