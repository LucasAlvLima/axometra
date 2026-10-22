import { useId } from "react";
import { MEASUREMENT_REGIONS, type BodyMeasurementRecordAnalysis, type MeasurementsSummary } from "@/lib/measurements/types";
import { describeCoverage, describeIssue, describeMeasurement, describeRecordScope, formatDate, regionLabels } from "@/lib/measurements/view";

function BodyEntry({ record, demo }: { record: BodyMeasurementRecordAnalysis; demo: boolean }) {
  return (
    <details className="min-w-0 rounded-xl border border-border bg-background/40 p-4">
      <summary className="min-h-11 cursor-pointer py-2 text-sm leading-relaxed">
        <span className="font-semibold">{record.date ? <time dateTime={record.date}>{formatDate(record.date)}</time> : "Registro sem data classificável"}</span>
        <span className="mt-1 block text-muted">Consultar oito regiões e sua inclusão nos indicadores · cm</span>
        {record.issues.includes("same-date-conflict") && <span className="mt-1 block text-muted">Conflito de data: grupo excluído dos indicadores</span>}
        {demo && <span className="mt-2 block text-xs text-primary">Demonstração — dados fictícios</span>}
      </summary>
      <p className="mt-3 text-xs text-muted">{describeRecordScope(record)}</p>
      <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">{MEASUREMENT_REGIONS.map((region) => <div key={region} className="min-w-0"><dt className="text-sm font-medium">{regionLabels[region]}</dt><dd className="mt-1 text-sm leading-relaxed text-muted">{describeMeasurement(record.values[region], "cm")}</dd></div>)}</dl>
      {record.issues.length > 0 && <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-muted">{record.issues.map((issue) => <li key={issue}>{describeIssue(issue)}</li>)}</ul>}
      <p className="mt-4 text-sm font-medium">Observação</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">{record.observation ?? "Sem observação disponível."}</p>
    </details>
  );
}

export function BodyMeasurementHistory({ records, regions, periodLabel, demo }: {
  records: readonly BodyMeasurementRecordAnalysis[]; regions: MeasurementsSummary["regions"]; periodLabel: string | null; demo: boolean;
}) {
  const id = useId();
  const selected = records.filter((record) => record.inPeriod);
  const other = records.filter((record) => !record.inPeriod);
  const entries = (items: readonly BodyMeasurementRecordAnalysis[]) => <ul className="grid min-w-0 gap-3 lg:grid-cols-2">{items.map((record) => <li key={`body-${record.id}`} className="min-w-0"><BodyEntry record={record} demo={demo} /></li>)}</ul>;
  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">Histórico de medidas corporais</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 text-sm text-muted">{periodLabel ?? "Período ainda não definido"} · cm</p>
      <p className="mt-3 text-xs leading-relaxed text-muted">Regiões e lados independentes. Campos ausentes não representam zero. Pendências descrevem os dados, sem interpretação clínica.</p>
      <details className="my-5 border-y border-border py-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Cobertura das oito regiões</summary><dl className="grid gap-4 pb-4 sm:grid-cols-2">{MEASUREMENT_REGIONS.map((region) => <div key={region}><dt className="text-sm font-medium">{regionLabels[region]}</dt><dd className="mt-1 text-xs leading-relaxed text-muted">{describeCoverage(regions[region].coverage)}</dd></div>)}</dl></details>
      {selected.length > 0 ? entries(selected) : <p className="text-sm leading-relaxed text-muted">{records.length === 0 ? "Nenhum registro de medidas corporais disponível." : "Nenhum registro corporal atribuído ao período. Os demais registros continuam consultáveis abaixo."}</p>}
      {other.length > 0 && <details className="mt-5 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Consultar registros fora do período ou sem data classificável ({other.length})</summary><div className="mt-3">{entries(other)}</div></details>}
    </section>
  );
}
