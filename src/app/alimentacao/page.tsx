import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard, type PresentationMetric } from "@/components/dashboard/metric-card";
import { MacroDistribution } from "@/components/nutrition/macro-distribution";
import { MealList, nutritionCoverage } from "@/components/nutrition/meal-list";
import { AuthenticationUnavailableError, requireUser } from "@/lib/auth/session";
import { demoNutrition, emptyNutrition } from "@/lib/nutrition/demo";
import { summarizeNutrition } from "@/lib/nutrition/summary";
import type { NutritionDay } from "@/lib/nutrition/types";

export const metadata: Metadata = { title: "Alimentação | AXOMETRA" };

type NutritionPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function NutritionContent({ searchParams }: NutritionPageProps) {
  try {
    await requireUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;
    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-5">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <h1 className="text-2xl font-semibold">Acesso temporariamente indisponível</h1>
          <p role="status" className="mt-4 text-sm leading-relaxed text-muted">Não foi possível verificar seu acesso. Tente novamente em instantes.</p>
          <a href="/alimentacao" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">Tentar novamente</a>
        </section>
      </main>
    );
  }

  const demo = (await searchParams).view === "demo";
  const data: NutritionDay = demo ? demoNutrition : emptyNutrition;
  const summary = summarizeNutrition(data);
  const dayLabel = data.date === null ? null : `${data.date.split("-").reverse().join("/")} · ${demo ? "dia ilustrativo · " : ""}${data.timeZone}`;
  const definitions = [
    { id: "nutrition-energy", label: "Energia informada", metric: summary.reportedEnergyKcal, unit: "kcal" },
    { id: "nutrition-protein", label: "Proteínas", metric: summary.proteinG, unit: "g" },
    { id: "nutrition-carbohydrate", label: "Carboidratos", metric: summary.carbohydrateG, unit: "g" },
    { id: "nutrition-fat", label: "Gorduras", metric: summary.fatG, unit: "g" },
  ];
  const metrics: PresentationMetric[] = definitions.map((entry) => ({
    id: entry.id,
    label: entry.metric.completeness === "partial" ? `${entry.label} (subtotal parcial)` : entry.label,
    value: entry.metric.value === null ? entry.metric.missingCount > 0 ? "Não informado" : null : entry.metric.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }),
    unit: entry.metric.value === null ? "" : entry.unit,
    detail: `${dayLabel === null ? "Valores do dia, a partir dos registros. " : `${dayLabel}. `}${nutritionCoverage(entry.metric)}`,
  }));

  return (
    <DashboardShell demo={demo} periodLabel={dayLabel} activePath="/alimentacao" title="Alimentação" eyebrow="Seu acompanhamento alimentar" description="Energia, macros e refeições registrados, com unidades e cobertura explícitas.">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} demo={demo} />)}
      </div>
      <div className="mt-6 space-y-6">
        <MacroDistribution summary={summary} demo={demo} dayLabel={dayLabel} />
        <MealList data={data} summary={summary} demo={demo} dayLabel={dayLabel} />
      </div>
    </DashboardShell>
  );
}

export default function NutritionPage({ searchParams }: NutritionPageProps) {
  return (
    <Suspense fallback={<main className="px-5 py-10"><p role="status" className="text-sm text-muted">Verificando acesso…</p></main>}>
      <NutritionContent searchParams={searchParams} />
    </Suspense>
  );
}
