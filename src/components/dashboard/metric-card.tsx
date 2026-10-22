export type PresentationMetric = Readonly<{
  id: string;
  label: string;
  value: string | null;
  unit: string;
  detail: string;
}>;

type MetricPresentation = Readonly<{
  context: string;
  coverage: string;
  notice?: string;
}>;

export function MetricCard({ metric, demo, compact = false, presentation }: { metric: PresentationMetric; demo: boolean; compact?: boolean; presentation?: MetricPresentation }) {
  // Only select a typographic scale: never infer data status or rewrite values.
  // Short values with units get prominence; prose and long values keep room.
  const prominentValue = metric.value !== null && metric.unit.length > 0 && metric.value.length <= 10;
  return (
    <section aria-labelledby={`metric-${metric.id}`} className={`flex h-full min-w-0 flex-col rounded-2xl border border-border bg-surface sm:p-5 xl:p-6 ${compact ? "p-3" : "p-4"}`}>
      <h2 id={`metric-${metric.id}`} className="text-sm font-medium leading-relaxed text-muted">{metric.label}</h2>
      {demo && <p className={`text-xs leading-relaxed text-primary ${compact ? "mt-1 sm:mt-2" : "mt-2"}`}>Demonstração — dados fictícios</p>}
      <p className={`flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums sm:mt-5 ${compact ? "mt-2" : "mt-4"}`}>
        <span className={`min-w-0 max-w-full [overflow-wrap:anywhere] font-semibold tracking-tight ${prominentValue ? "text-4xl leading-tight text-foreground sm:text-[2.5rem]" : "text-xl leading-snug text-foreground sm:text-2xl"}`}>
          {metric.value ?? "Sem registros"}
        </span>
        {metric.value !== null && metric.unit && <span className="text-sm font-medium leading-relaxed text-muted">{" "}{metric.unit}</span>}
      </p>
      {presentation ? (
        <div className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
          <p>{presentation.context}</p>
          <p className="mt-1">{presentation.coverage}</p>
          {presentation.notice && <p className="mt-2 font-medium text-foreground">{presentation.notice}</p>}
          <details className="mt-2">
            <summary className="min-h-11 cursor-pointer content-center rounded-md py-2 font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Cobertura e critérios</summary>
            <p className="pb-1 pt-2">{metric.detail}</p>
          </details>
        </div>
      ) : (
        <p className={`border-t border-border text-xs leading-relaxed text-muted [overflow-wrap:anywhere] ${compact ? "mt-2 pt-2 sm:mt-4 sm:pt-3" : "mt-4 pt-3"}`}>{metric.detail}</p>
      )}
    </section>
  );
}
