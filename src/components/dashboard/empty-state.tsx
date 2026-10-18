export function EmptyState({ description }: { description: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-8 text-center">
      <p className="text-sm font-medium text-foreground">Sem registros</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
