import { useId } from "react";
import type { MeasurementSeriesSummary, WeightRecordAnalysis } from "@/lib/measurements/types";
import { describeCoverage, describeIssue, describeMeasurement, describeRecordScope, formatDate } from "@/lib/measurements/view";

function WeightEntry({ record, demo }: { record: WeightRecordAnalysis; demo: boolean }) {
  return (
    <details className="min-w-0 rounded-xl border border-border bg-background/40 p-4">
      <summary className="min-h-11 cursor-pointer py-2 text-sm leading-relaxed">
        <span className="font-semibold">{record.date ? <time dateTime={record.date}>{formatDate(record.date)}</time> : "Registro sem data classificável"}</span>
        <span className="mt-1 block text-muted">{describeMeasurement(record.weight, "kg")}</span>
        {demo && <span className="mt-2 block text-xs text-primary">Demonstração — dados fictícios</span>}
      </summary>
      <p className="mt-3 text-xs text-muted">{describeRecordScope(record)}</p>
      {record.issues.length > 0 && <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-muted">{record.issues.map((issue) => <li key={issue}>{describeIssue(issue)}</li>)}</ul>}
      <p className="mt-4 text-sm font-medium">Observação</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">{record.observation ?? "Sem observação disponível."}</p>
    </details>
  );
}

export function WeightHistory({ records, series, periodLabel, demo }: {
  records: readonly WeightRecordAnalysis[]; series: MeasurementSeriesSummary<"kg">; periodLabel: string | null; demo: boolean;
}) {
  const id = useId();
  const selected = records.filter((record) => record.inPeriod);
  const other = records.filter((record) => !record.inPeriod);
  const entries = (items: readonly WeightRecordAnalysis[]) => <ul className="grid min-w-0 gap-3 lg:grid-cols-2">{items.map((record) => <li key={`weight-${record.id}`} className="min-w-0"><WeightEntry record={record} demo={demo} /></li>)}</ul>;
  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">Histórico de peso</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 text-sm text-muted">{periodLabel ?? "Período ainda não definido"} · kg</p>
      <p className="mt-3 mb-5 text-xs leading-relaxed text-muted">{describeCoverage(series.coverage)}</p>
      {selected.length > 0 ? entries(selected) : <p className="text-sm leading-relaxed text-muted">{records.length === 0 ? "Nenhum registro de peso disponível." : "Nenhum registro de peso atribuído ao período. Os demais registros continuam consultáveis abaixo."}</p>}
      {other.length > 0 && <details className="mt-5 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Consultar registros fora do período ou sem data classificável ({other.length})</summary><div className="mt-3">{entries(other)}</div></details>}
    </section>
  );
}
