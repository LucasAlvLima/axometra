import { EmptyState } from "@/components/dashboard/empty-state";
import type { NutritionSummary } from "@/lib/nutrition/types";
import { nutritionCoverage, nutritionMetricText } from "./meal-list";

export function MacroDistribution({ summary, demo, dayLabel }: {
  summary: NutritionSummary;
  demo: boolean;
  dayLabel: string | null;
}) {
  const distribution = summary.distribution;
  const rows = distribution === null ? [] : [
    { label: "Proteínas", percent: distribution.proteinPercent },
    { label: "Carboidratos", percent: distribution.carbohydratePercent },
    { label: "Gorduras", percent: distribution.fatPercent },
  ];

  return (
    <section aria-labelledby="distribution-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="distribution-title" className="text-lg font-semibold">Energia e distribuição dos macros</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{dayLabel ?? "Os dados do dia serão exibidos a partir dos registros."}</p>

      <h3 className="text-sm font-semibold">Energia informada e estimada</h3>
      <dl className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Informada nos registros</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums">{nutritionMetricText(summary.reportedEnergyKcal, "kcal")}</dd>
          <dd className="mt-2 text-xs leading-relaxed text-muted">{nutritionCoverage(summary.reportedEnergyKcal)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Estimativa pelos macros (4/4/9)</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums">{nutritionMetricText(summary.estimatedEnergyKcal, "kcal")}</dd>
          <dd className="mt-2 text-xs leading-relaxed text-muted">{nutritionCoverage(summary.estimatedEnergyKcal)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        {summary.energyDifferenceKcal === null ? "Diferença indisponível: a comparação requer ambas as energias completas." : `Diferença (informada menos estimada): ${summary.energyDifferenceKcal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kcal.`}
        {" "}A estimativa não substitui a energia informada nem determina a causa de eventual diferença.
      </p>

      <h3 className="mt-7 text-sm font-semibold">Participação na energia estimada</h3>
      <p className="mt-2 mb-5 text-xs leading-relaxed text-muted">Percentuais da energia estimada pelos macros, não dos gramas ou das kcal informadas. Não representam metas nutricionais.</p>
      {distribution === null ? summary.meals.length === 0 ? (
        <EmptyState description="A distribuição será exibida quando houver registros com macros completos e energia estimada maior que zero." />
      ) : (
        <div className="rounded-xl border border-border px-5 py-6">
          <p className="text-sm font-medium">Distribuição indisponível</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">Há refeições registradas, mas a distribuição requer macros completos e energia estimada maior que zero. Percentuais indisponíveis não são preenchidos com zero.</p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span>{row.label}</span><span className="font-medium text-primary tabular-nums">{row.percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span></div>
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} /></div>
              </div>
            ))}
          </div>
          <details className="mt-6 rounded-lg border border-border px-4 py-3">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary">Ver distribuição em tabela</summary>
            <table className="mt-3 w-full text-left text-sm tabular-nums">
              <caption className="pb-3 text-left text-xs leading-relaxed text-muted">{demo ? "Demonstração — dados fictícios. " : ""}{dayLabel} · Participação na energia estimada.</caption>
              <thead><tr className="border-b border-border"><th scope="col" className="py-2 font-medium">Macro</th><th scope="col" className="py-2 text-right font-medium">Energia (%)</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.label} className="border-b border-border last:border-0"><th scope="row" className="py-2 font-normal">{row.label}</th><td className="py-2 text-right">{row.percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</td></tr>)}</tbody>
            </table>
          </details>
          <p className="mt-3 text-xs leading-relaxed text-muted">Percentuais arredondados apenas na apresentação; a soma visual pode diferir de 100%.</p>
        </>
      )}
    </section>
  );
}
