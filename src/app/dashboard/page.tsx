import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { AuthenticationUnavailableError, requireUser } from "@/lib/auth/session";
import { demoDashboard } from "@/lib/dashboard/demo";
import type { DashboardData, DashboardMetric, WeightPoint } from "@/lib/dashboard/types";

export const metadata: Metadata = {
  title: "Meu Dashboard | AXOMETRA",
};

type DashboardPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function DashboardContent({ searchParams }: DashboardPageProps) {
  try {
    await requireUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;

    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-5">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <h1 className="text-2xl font-semibold">Acesso temporariamente indisponível</h1>
          <p role="status" className="mt-4 text-sm leading-relaxed text-muted">
            Não foi possível verificar seu acesso. Tente novamente em instantes.
          </p>
          <a href="/dashboard" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">
            Tentar novamente
          </a>
        </section>
      </main>
    );
  }

  // Query mode is read only after authorization. Unknown or repeated values
  // intentionally show the empty personal view, never the demonstration.
  const demo = (await searchParams).view === "demo";
  const data: DashboardData = demo ? demoDashboard : { periodLabel: null, days: [] };
  const weights: WeightPoint[] = data.days.flatMap((day) => day.weightKg === null ? [] : [{ date: day.date, weightKg: day.weightKg }]);
  const calories = data.days.flatMap((day) => day.caloriesKcal === null ? [] : [day.caloriesKcal]);
  const workouts = data.days.flatMap((day) => day.workouts === null ? [] : [day.workouts]);
  const sleep = data.days.flatMap((day) => day.sleepMinutes === null ? [] : [day.sleepMinutes]);
  const lastWeight = weights.at(-1);
  const average = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const sleepAverage = sleep.length ? Math.round(average(sleep)) : null;
  const metrics: DashboardMetric[] = [
    {
      id: "weight", label: "Peso", value: lastWeight ? lastWeight.weightKg.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : null, unit: "kg",
      detail: lastWeight ? `Último registro: ${lastWeight.date.split("-").reverse().join("/")}.` : "O último peso registrado aparecerá aqui.",
    },
    {
      id: "calories", label: "Calorias ingeridas", value: calories.length ? Math.round(average(calories)).toLocaleString("pt-BR") : null, unit: "kcal/dia",
      detail: calories.length ? `Média de ${calories.length} dias com registros no período ilustrativo.` : "A média diária usará apenas dias com registros.",
    },
    {
      id: "workouts", label: "Treinos", value: workouts.length ? workouts.reduce((sum, value) => sum + value, 0).toLocaleString("pt-BR") : null, unit: "sessões",
      detail: workouts.length ? `Total no período ilustrativo; ${workouts.length} dias informados.` : "As sessões registradas no período aparecerão aqui.",
    },
    {
      id: "sleep", label: "Sono", value: sleepAverage === null ? null : `${Math.floor(sleepAverage / 60)}h ${String(sleepAverage % 60).padStart(2, "0")}min`, unit: "por noite",
      detail: sleep.length ? `Média de ${sleep.length} noites com registros no período ilustrativo.` : "A média usará apenas noites com registros.",
    },
  ];

  return (
    <DashboardShell demo={demo} periodLabel={data.periodLabel} description="Sua performance, traduzida em dados" compact>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} demo={demo} compact />)}
      </div>
      <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 sm:mt-6 sm:gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <WeightChart points={weights} periodLabel={data.periodLabel} demo={demo} />
        <WeeklySummary metrics={metrics} periodLabel={data.periodLabel} demo={demo} />
      </div>
    </DashboardShell>
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense fallback={<main className="px-5 py-10"><p role="status" className="text-sm text-muted">Verificando acesso…</p></main>}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
