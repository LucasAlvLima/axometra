import type { DashboardMetric } from "@/lib/dashboard/types";
import { EmptyState } from "./empty-state";

export function WeeklySummary({ metrics, periodLabel, demo }: {
  metrics: readonly DashboardMetric[];
  periodLabel: string | null;
  demo: boolean;
}) {
  const hasRecords = metrics.some((metric) => metric.value !== null);
  return (
    <section aria-labelledby="weekly-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="weekly-title" className="text-lg font-semibold">Resumo semanal</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{periodLabel ?? "Uma visão integrada dos seus registros."}</p>
      <details>
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 text-sm font-medium text-primary">
          {hasRecords ? "Ver indicadores da semana" : "Ver estado dos registros"}
        </summary>
        <div className="mt-4">
          {hasRecords ? (
            <dl className="divide-y divide-border">
              {metrics.map((metric) => (
                <div key={metric.id} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm text-muted">{metric.label}</dt>
                  <dd className="mt-1 text-lg font-medium tabular-nums">{metric.value ?? "Sem registros"} {metric.value !== null && metric.unit}</dd>
                  <dd className="mt-1 text-xs leading-relaxed text-muted">{metric.detail}</dd>
                </div>
              ))}
            </dl>
          ) : <EmptyState description="O resumo reunirá peso, alimentação, treinos e sono quando o acompanhamento estiver disponível." />}
        </div>
      </details>
    </section>
  );
}
