import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard, type PresentationMetric } from "@/components/dashboard/metric-card";
import { SleepDurationChart } from "@/components/sleep/sleep-duration-chart";
import { SleepRecords } from "@/components/sleep/sleep-records";
import { AuthenticationUnavailableError, requireUser } from "@/lib/auth/session";
import { demoSleep, emptySleep } from "@/lib/sleep/demo";
import { SleepContractError, summarizeSleep } from "@/lib/sleep/summary";
import type { SleepData, SleepSummary } from "@/lib/sleep/types";

export const metadata: Metadata = { title: "Sono | AXOMETRA" };

type SleepPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const completenessLabels = {
  empty: "Sem registros",
  partial: "Cobertura parcial",
  complete: "Cobertura completa",
} as const;

function formatWindow(minutes: number): string {
  // Formatting only: the average and eligible nights come from summarizeSleep.
  const displayedMinutes = Math.round(minutes);
  return `${Math.floor(displayedMinutes / 60)}h ${String(displayedMinutes % 60).padStart(2, "0")}min`;
}

async function SleepContent({ searchParams }: SleepPageProps) {
  try {
    await requireUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;
    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-5">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <h1 className="text-2xl font-semibold">Acesso temporariamente indisponível</h1>
          <p role="status" className="mt-4 text-sm leading-relaxed text-muted">Não foi possível verificar seu acesso. Tente novamente em instantes.</p>
          <a href="/sono" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">Tentar novamente</a>
        </section>
      </main>
    );
  }

  const demo = (await searchParams).view === "demo";
  const data: SleepData = demo ? demoSleep : emptySleep;
  let summary: SleepSummary;
  try {
    summary = summarizeSleep(data);
  } catch (error: unknown) {
    if (!(error instanceof SleepContractError)) throw error;
    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-5">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <h1 className="text-2xl font-semibold">Dados de sono indisponíveis</h1>
          <p role="alert" className="mt-4 text-sm leading-relaxed text-muted">Não foi possível apresentar os indicadores de sono. Isso não significa ausência de registros.</p>
          <a href="/sono" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">Tentar novamente</a>
        </section>
      </main>
    );
  }

  const coverage = summary.coverage;
  const hasRecords = data.records.length > 0;
  const missingValue = hasRecords ? "Não disponível" : null;
  const periodLabel = data.period === null ? null : `${data.period.startDate.split("-").reverse().join("/")} a ${data.period.endDate.split("-").reverse().join("/")} · ${data.timeZone}`;
  const durationCoverage = `${completenessLabels[coverage.durationCompleteness]}. ${coverage.validWindowNights} de ${coverage.registeredNightCount} noites registradas com janelas válidas; ${coverage.incompleteWindowNights} incompletas, ${coverage.invalidWindowNights} inválidas, ${coverage.conflictedNights} com conflito.`;
  const metrics: PresentationMetric[] = [
    {
      id: "sleep-window-average",
      label: "Duração média da janela",
      value: summary.averageWindowMinutes === null ? missingValue : formatWindow(summary.averageWindowMinutes),
      unit: summary.averageWindowMinutes === null ? "" : "por noite válida",
      detail: hasRecords ? `${durationCoverage} Intervalo declarado, não sono efetivo.` : "A média usará somente janelas válidas. O intervalo declarado não mede sono efetivo.",
    },
    {
      id: "sleep-registered-nights",
      label: "Noites registradas",
      value: summary.registeredNights === null ? missingValue : summary.registeredNights.toLocaleString("pt-BR"),
      unit: summary.registeredNights === null ? "" : "noites",
      detail: hasRecords ? `${coverage.registeredNightCount} noites registradas de ${coverage.periodNights ?? "período não informado"}; ${coverage.unregisteredNights ?? "não informado"} sem registro. Associação pela data local de despertar; ${coverage.unassignedRecordCount} registros sem data de despertar classificável.` : "As datas locais de despertar distintas serão contadas no período em America/Sao_Paulo.",
    },
    {
      id: "sleep-illustrative-range",
      label: "Faixa ilustrativa · 7–9h",
      value: summary.illustrativeRangeNights === null ? missingValue : summary.illustrativeRangeNights.toLocaleString("pt-BR"),
      unit: summary.illustrativeRangeNights === null ? "" : "noites",
      detail: hasRecords ? `${summary.illustrativeRangeNights === null ? "Contagem indisponível" : `${summary.illustrativeRangeNights} de ${coverage.validWindowNights} janelas válidas na faixa`}. ${completenessLabels[coverage.durationCompleteness]}. Faixa meramente ilustrativa, não recomendação clínica ou meta pessoal.` : "A contagem usará janelas válidas. Faixa meramente ilustrativa, não recomendação clínica ou meta pessoal.",
    },
    {
      id: "sleep-perceived-quality",
      label: "Qualidade percebida média",
      value: summary.averageQuality === null ? missingValue : summary.averageQuality.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
      unit: summary.averageQuality === null ? "" : "/ 5",
      detail: hasRecords ? `${completenessLabels[coverage.qualityCompleteness]}. ${coverage.availableQualityCount} avaliações disponíveis de ${coverage.registeredNightCount} noites registradas; ${coverage.missingQualityCount} sem avaliação, ${coverage.invalidQualityCount} inválidas. Avaliação subjetiva de 1 a 5, independente da validade da janela; noites em conflito não entram na média.` : "A média usará avaliações disponíveis na escala subjetiva de 1 a 5. Ausência de avaliação não será apresentada como zero.",
    },
  ];

  return (
    <DashboardShell demo={demo} periodLabel={periodLabel} activePath="/sono" title="Sono" eyebrow="Seu descanso registrado" description="Janelas declaradas e qualidade percebida. A duração é uma estimativa do intervalo, não uma medida de sono efetivo.">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} demo={demo} />)}
      </div>
      {!hasRecords && <div className="mt-6"><EmptyState description="Sua visão de sono reunirá janelas declaradas e avaliações de qualidade quando houver registros disponíveis." /></div>}
      <div className="mt-6 min-w-0 space-y-6">
        <SleepDurationChart data={data} summary={summary} demo={demo} periodLabel={periodLabel} />
        <SleepRecords data={data} summary={summary} demo={demo} periodLabel={periodLabel} />
      </div>
      {demo && <p className="mt-5 text-xs leading-relaxed text-muted">Esta demonstração fixa de Sono é independente dos exemplos do Dashboard; os dados não são sincronizados entre os módulos.</p>}
    </DashboardShell>
  );
}

export default function SleepPage({ searchParams }: SleepPageProps) {
  return (
    <Suspense fallback={<main className="px-5 py-10"><p role="status" className="text-sm text-muted">Verificando acesso…</p></main>}>
      <SleepContent searchParams={searchParams} />
    </Suspense>
  );
}
