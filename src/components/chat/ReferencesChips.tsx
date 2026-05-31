function displayRef(ref: string) {
  const normalized = ref.replaceAll("\\", "/");
  return normalized.split("/").filter(Boolean).pop() ?? ref;
}

export function ReferencesChips({ refs }: { refs: string[] }) {
  if (!refs.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Base usada:</span>
      {refs.map((r) => (
        <span
          key={r}
          title={r}
          className="inline-flex items-center rounded-full border border-border bg-accent/35 px-2.5 py-1 font-mono text-[11px] text-foreground/80"
        >
          {displayRef(r)}
        </span>
      ))}
    </div>
  );
}
