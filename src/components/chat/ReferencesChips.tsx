export function ReferencesChips({ refs }: { refs: string[] }) {
  if (!refs.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Base usada:</span>
      {refs.map((r) => (
        <span
          key={r}
          className="inline-flex items-center rounded-md border border-border bg-accent/40 px-2 py-0.5 font-mono text-[11px] text-foreground/80"
        >
          {r}
        </span>
      ))}
    </div>
  );
}
