import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard, type PresentationMetric } from "@/components/dashboard/metric-card";
import { BodyMeasurementHistory } from "@/components/measurements/body-measurement-history";
import { MeasurementRegionSelector } from "@/components/measurements/measurement-region-selector";
import { MeasurementTrendChart } from "@/components/measurements/measurement-trend-chart";
import { WeightHistory } from "@/components/measurements/weight-history";
import { AuthenticationUnavailableError, requireUser } from "@/lib/auth/session";
import { demoMeasurements, emptyMeasurements } from "@/lib/measurements/demo";
import { summarizeMeasurements } from "@/lib/measurements/summary";
import { MeasurementsContractError, type MeasurementSeriesSummary, type MeasurementsSummary } from "@/lib/measurements/types";

import { describeCoverage, formatDate, formatValue, measurementRegionHref, regionLabels, selectMeasurementRegion } from "@/lib/measurements/view";

export const metadata: Metadata = { title: "Peso & Medidas | AXOMETRA" };

type MeasurementsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function createMetrics(series: MeasurementSeriesSummary<"kg" | "cm">, name: string, id: string, recordCount: number, periodLabel: string | null): readonly PresentationMetric[] {
  const unavailable = recordCount > 0 ? "Não disponível" : null;
  const context = `Período: ${periodLabel ?? "não definido"}. Unidade: ${series.unit}. ${describeCoverage(series.coverage)}`;
  const reference = series.first !== null && series.latest !== null && series.deltaSigned !== null
    ? `Referência: ${formatDate(series.first.date)} a ${formatDate(series.latest.date)}. Último valor menos primeiro; sinal neutro, sem avaliação de melhora ou piora.`
    : "A variação exige duas datas distintas com valores válidos no período.";
  return [
    {
      id: `${id}-latest`, label: `${name} atual`,
      value: series.latest === null ? unavailable : formatValue(series.latest.value),
      unit: series.latest === null ? "" : series.unit,
      detail: `${series.latest === null ? "Sem medição válida disponível." : `Última medição válida: ${formatDate(series.latest.date)}.`} ${context}`,
    },
    {
      id: `${id}-variation`, label: `Variação de ${name.toLocaleLowerCase("pt-BR")}`,
      value: series.deltaSigned === null ? unavailable : formatValue(series.deltaSigned, true),
      unit: series.deltaSigned === null ? "" : series.unit,
      detail: `${reference} ${context}`,
    },
  ];
}

function createCardPresentation(series: MeasurementSeriesSummary<"kg" | "cm">, variation: boolean, hasInvalidObservation: boolean) {
  const { coverage, first, latest, deltaSigned } = series;
  const context = variation
    ? first !== null && latest !== null && deltaSigned !== null
      ? `${formatDate(first.date)} a ${formatDate(latest.date)}`
      : "Referência indisponível: são necessárias duas datas válidas."
    : latest !== null ? `Medição de ${formatDate(latest.date)}` : "Sem medição válida no período.";
  const coverageLabel = coverage.registeredDates > 0
    ? `${coverage.validValueDates} de ${coverage.registeredDates} datas com valor válido`
    : "Sem datas registradas no período";
  const warnings = [
    coverage.missingValueDates > 0 && "valores ausentes",
    coverage.invalidValueDates > 0 && "valores inválidos",
    coverage.conflictDates > 0 && "datas com conflito",
    coverage.unassignedRecordCount > 0 && "registros sem data classificável",
    coverage.outOfPeriodRecordCount > 0 && "registros fora do período",
    hasInvalidObservation && "observações em formato inválido",
  ].filter(Boolean);
  return {
    context,
    coverage: coverageLabel,
    notice: warnings.length > 0 ? `Atenção: ${warnings.join(", ")}. Consulte a cobertura e os históricos.` : undefined,
  };
}

function Unavailable({ authentication = false }: { authentication?: boolean }) {
  return (
    <main className="mx-auto my-10 w-full max-w-3xl px-5">
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
        <h1 className="text-2xl font-semibold">{authentication ? "Acesso temporariamente indisponível" : "Dados de peso e medidas indisponíveis"}</h1>
        <p role={authentication ? "status" : "alert"} className="mt-4 text-sm leading-relaxed text-muted">{authentication ? "Não foi possível verificar seu acesso. Tente novamente em instantes." : "Não foi possível apresentar os indicadores. Isso não significa ausência de registros."}</p>
        <a href="/medidas" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">Tentar novamente</a>
      </section>
    </main>
  );
}

async function MeasurementsContent({ searchParams }: MeasurementsPageProps) {
  try {
    // requireUser already establishes connection() and confirms identity with getUser().
    await requireUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;
    return <Unavailable authentication />;
  }

  // Repeated query parameters are arrays in Next.js and cannot activate demo.
  const query = await searchParams;
  const demo = query.view === "demo";
  const region = selectMeasurementRegion(query.region);
  const data = demo ? demoMeasurements : emptyMeasurements;
  let summary: MeasurementsSummary;
  try {
    summary = summarizeMeasurements(data);
  } catch (error: unknown) {
    if (!(error instanceof MeasurementsContractError)) throw error;
    return <Unavailable />;
  }

  const periodLabel = summary.period === null ? null : `${formatDate(summary.period.startDate)} a ${formatDate(summary.period.endDate)}`;
  const metrics = [
    ...createMetrics(summary.weight, "Peso", "measurements-weight", data.weightRecords.length, periodLabel),
    ...createMetrics(summary.regions.waist, "Cintura", "measurements-waist", data.measurementRecords.length, periodLabel),
  ];
  const hasRecords = data.weightRecords.length > 0 || data.measurementRecords.length > 0;
  const weightObservationIssue = summary.records.weightRecords.some((record) => record.issues.includes("invalid-observation"));
  const measurementObservationIssue = summary.records.measurementRecords.some((record) => record.issues.includes("invalid-observation"));

  return (
    <DashboardShell demo={demo} periodLabel={periodLabel} activePath="/medidas" modeLinks={{ personal: measurementRegionHref(region, false), demo: measurementRegionHref(region, true) }} title="Peso & Medidas" eyebrow="Sua evolução registrada" description="Peso e medidas corporais em registros independentes. Variações descrevem os valores registrados, sem interpretações clínicas.">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => <MetricCard key={metric.id} metric={metric} demo={demo} compact presentation={createCardPresentation(index < 2 ? summary.weight : summary.regions.waist, index % 2 === 1, index < 2 ? weightObservationIssue : measurementObservationIssue)} />)}
      </div>
      {!hasRecords && <div className="mt-6"><EmptyState description="Seu acompanhamento reunirá peso e medidas corporais quando houver registros disponíveis. Nenhuma medição é apresentada como zero por ausência de dados." /></div>}
      <div className="mt-6 grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <MeasurementTrendChart title="Evolução do peso" series={summary.weight} periodLabel={periodLabel} demo={demo} />
          <div className="grid min-w-0 content-start gap-4">
            <MeasurementRegionSelector region={region} demo={demo} />
            <MeasurementTrendChart title={`Evolução: ${regionLabels[region]}`} series={summary.regions[region]} periodLabel={periodLabel} demo={demo} />
          </div>
        </div>
        <WeightHistory records={summary.records.weightRecords} series={summary.weight} periodLabel={periodLabel} demo={demo} />
        <BodyMeasurementHistory records={summary.records.measurementRecords} regions={summary.regions} periodLabel={periodLabel} demo={demo} />
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted">Datas civis em America/Sao_Paulo. A cobertura descreve os registros disponíveis, sem estabelecer uma frequência obrigatória de medição.</p>
    </DashboardShell>
  );
}

export default function MeasurementsPage({ searchParams }: MeasurementsPageProps) {
  return (
    <Suspense fallback={<main className="px-5 py-10"><p role="status" className="text-sm text-muted">Verificando acesso…</p></main>}>
      <MeasurementsContent searchParams={searchParams} />
    </Suspense>
  );
}
