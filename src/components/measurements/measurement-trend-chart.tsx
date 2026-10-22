import { useId } from "react";
import type { MeasurementSeriesSummary } from "@/lib/measurements/types";
import { describeCoverage, formatDate, formatValue, measurementDayOrdinal } from "@/lib/measurements/view";

export function MeasurementTrendChart({ title, series, periodLabel, demo }: {
  title: string; series: MeasurementSeriesSummary<"kg" | "cm">; periodLabel: string | null; demo: boolean;
}) {
  const id = useId();
  const points = series.points;
  const first = points[0];
  const last = points[points.length - 1];
  const minimum = points.length > 0 ? Math.min(...points.map((point) => point.value)) : 0;
  const maximum = points.length > 0 ? Math.max(...points.map((point) => point.value)) : 0;
  const padding = Math.max((maximum - minimum) * 0.2, Math.abs(maximum) * 0.005, 0.000001);
  const low = Math.max(0, minimum - padding);
  const high = maximum + padding;
  const days = first && last ? measurementDayOrdinal(last.date) - measurementDayOrdinal(first.date) : 0;
  const x = (date: string) => first && days > 0 ? 14 + (measurementDayOrdinal(date) - measurementDayOrdinal(first.date)) / days * 532 : 280;
  const y = (value: number) => 166 - (value - low) / (high - low) * 152;
  const axisValue = (value: number) => value.toLocaleString("pt-BR", {
    maximumSignificantDigits: 4,
    notation: value > 0 && value < 0.0001 ? "scientific" : "standard",
  });

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">{title}</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 text-sm text-muted">{periodLabel ?? "Período ainda não definido"} · {series.unit}</p>
      <p id={`${id}-description`} className="mt-3 text-xs leading-relaxed text-muted">Cada ponto representa uma medição válida. Datas mantêm sua distância temporal. Dias ausentes não recebem zero e os pontos não são ligados ou interpolados.</p>
      {points.length === 0 ? <p className="my-8 text-sm leading-relaxed text-muted">Nenhum valor elegível para este gráfico. Ausências, valores inválidos e conflitos não são desenhados como zero.</p> : (
        <div className="mt-5 min-w-0">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2">
          <div className="flex max-w-24 flex-col justify-between py-1 text-xs text-muted [overflow-wrap:anywhere]"><span>{axisValue(high)} {series.unit}</span><span>{axisValue(low)} {series.unit}</span></div>
          <svg role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} viewBox="0 0 560 180" className="block w-full overflow-visible">
            <title id={`${id}-title`}>{`${title}: ${points.length} medições, em ${series.unit}`}</title>
            {[14, 90, 166].map((position) => <line key={position} x1="14" x2="546" y1={position} y2={position} stroke="var(--border)" strokeWidth="1" />)}
            <line x1="14" x2="14" y1="14" y2="166" stroke="var(--muted)" />
            <line x1="14" x2="546" y1="166" y2="166" stroke="var(--muted)" />
            {points.map((point) => <circle key={point.recordId} cx={x(point.date)} cy={y(point.value)} r="5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1.5"><title>{`${formatDate(point.date)}: ${formatValue(point.value)} ${series.unit}`}</title></circle>)}
          </svg>
          </div>
          <div className={`mt-2 flex gap-3 text-xs text-muted ${days > 0 ? "justify-between" : "justify-center"}`}><span>{first ? formatDate(first.date) : ""}</span>{days > 0 && last && <span>{formatDate(last.date)}</span>}</div>
          <p className="mt-2 text-xs text-muted">Eixo horizontal: data civil. Eixo vertical: {series.unit}; escala ajustada às medições.</p>
        </div>
      )}
      <details className="mt-5 border-t border-border pt-3">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Consultar valores e cobertura</summary>
        <p className="my-3 text-xs leading-relaxed text-muted">{describeCoverage(series.coverage)}</p>
        {points.length > 0 && <table className="w-full table-fixed text-left text-sm"><caption className="pb-3 text-left text-xs leading-relaxed text-muted">{title} · {periodLabel ?? "Período não definido"}{demo ? " · Demonstração — dados fictícios" : ""}. Valores da série válida em {series.unit}.</caption><thead><tr className="border-b border-border"><th scope="col" className="py-3 pr-2">Data</th><th scope="col" className="py-3">Valor ({series.unit})</th></tr></thead><tbody>{points.map((point) => <tr key={point.recordId} className="border-b border-border"><th scope="row" className="py-3 pr-2 font-normal"><time dateTime={point.date}>{formatDate(point.date)}</time></th><td className="py-3 tabular-nums">{formatValue(point.value)} {series.unit}</td></tr>)}</tbody></table>}
      </details>
    </section>
  );
}
