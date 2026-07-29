export function ComingSoon({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 px-5 py-6 md:py-10">
      <div className="relative overflow-hidden rounded-2xl px-1 py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-terracota/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 top-4 size-32 rounded-full bg-oliva/20 blur-3xl"
        />
        <span className="relative text-3xl">{emoji}</span>
        <h1 className="relative mt-2 font-heading text-3xl font-medium text-foreground">
          {title}
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-marinho px-5 py-5 text-branco-quente">
        <span aria-hidden className="absolute -right-3 -top-3 text-6xl opacity-15">
          🌱
        </span>
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-branco-quente/15 px-2.5 py-1 text-xs font-medium">
          🌱 Em breve
        </span>
        <p className="relative mt-3 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
