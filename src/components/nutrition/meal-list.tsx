import { EmptyState } from "@/components/dashboard/empty-state";
import type { NutritionDay, NutritionMetric, NutritionSummary, NutritionTotals } from "@/lib/nutrition/types";

export function nutritionCoverage(metric: NutritionMetric): string {
  const state = metric.completeness === "partial" ? "Subtotal parcial" : metric.completeness === "complete" ? "Dados completos" : "Sem registros";
  return `${state}. Itens com dados: ${metric.includedCount}; sem dados suficientes: ${metric.missingCount}.`;
}

export function nutritionMetricText(metric: NutritionMetric, unit: string): string {
  if (metric.value === null) return metric.missingCount > 0 ? "Não informado" : "Sem registros";
  return `${metric.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}${metric.completeness === "partial" ? " (subtotal parcial)" : ""}`;
}

function NutrientValues({ totals }: { totals: NutritionTotals }) {
  const values = [
    { label: "Energia informada", metric: totals.reportedEnergyKcal, unit: "kcal" },
    { label: "Energia estimada (4/4/9)", metric: totals.estimatedEnergyKcal, unit: "kcal" },
    { label: "Proteínas", metric: totals.proteinG, unit: "g" },
    { label: "Carboidratos", metric: totals.carbohydrateG, unit: "g" },
    { label: "Gorduras", metric: totals.fatG, unit: "g" },
  ];
  return (
    <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {values.map((value) => (
        <div key={value.label} className="min-w-0">
          <dt className="text-xs leading-relaxed text-muted">{value.label}</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{nutritionMetricText(value.metric, value.unit)}</dd>
          <dd className="mt-1 text-xs leading-relaxed text-muted">{nutritionCoverage(value.metric)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MealList({ data, summary, demo, dayLabel }: {
  data: NutritionDay;
  summary: NutritionSummary;
  demo: boolean;
  dayLabel: string | null;
}) {
  return (
    <section aria-labelledby="meals-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="meals-title" className="text-lg font-semibold">Refeições registradas</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{dayLabel ?? "As refeições aparecerão quando o acompanhamento estiver disponível."}</p>
      {data.meals.length === 0 ? <EmptyState description="O histórico reunirá refeições, quantidades e nutrientes registrados. Nenhuma ingestão foi presumida." /> : (
        <div className="space-y-5">
          {data.meals.map((meal) => {
            const mealSummary = summary.meals.find((item) => item.id === meal.id);
            if (!mealSummary) return null;
            return (
              <section key={meal.id} aria-labelledby={`meal-${meal.id}`} className="min-w-0 rounded-xl border border-border bg-background/40 p-4 sm:p-5">
                <h3 id={`meal-${meal.id}`} className="text-base font-semibold">{meal.label} · <time dateTime={meal.localTime}>{meal.localTime}</time></h3>
                {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
                <p className="mt-2 text-xs text-muted">{dayLabel} · Horário local: {data.timeZone}</p>
                <NutrientValues totals={mealSummary} />
                {meal.items.length === 0 ? <p className="mt-4 text-sm text-muted">Sem itens registrados nesta refeição.</p> : (
                  <details className="mt-5 rounded-lg border border-border p-3 sm:p-4">
                    <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary">Ver porções e nutrientes por item</summary>
                    <p className="mt-3 text-xs leading-relaxed text-muted">Valores da quantidade consumida; não representam automaticamente uma base de 100 g ou 100 ml.</p>
                    <ul className="mt-4 space-y-4">
                      {meal.items.map((item) => {
                        const itemSummary = mealSummary.items.find((entry) => entry.id === item.id);
                        if (!itemSummary) return null;
                        const unit = item.amount.unit === "portion" ? item.amount.value === 1 ? "porção" : "porções" : item.amount.unit;
                        return (
                          <li key={item.id} className="min-w-0 rounded-lg border border-border p-3 sm:p-4">
                            <h4 className="text-sm font-semibold">{item.label}</h4>
                            {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
                            <p className="mt-2 text-sm text-muted">Quantidade consumida: {item.amount.value.toLocaleString("pt-BR")} {unit}</p>
                            <NutrientValues totals={itemSummary} />
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
