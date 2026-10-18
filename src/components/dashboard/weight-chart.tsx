import type { WeightPoint } from "@/lib/dashboard/types";
import { EmptyState } from "./empty-state";

export function WeightChart({ points, periodLabel, demo }: {
  points: readonly WeightPoint[];
  periodLabel: string | null;
  demo: boolean;
}) {
  const values = points.map((point) => point.weightKg);
  const min = values.length ? Math.floor(Math.min(...values) * 2) / 2 - 0.5 : 0;
  const max = values.length ? Math.ceil(Math.max(...values) * 2) / 2 + 0.5 : 1;
  const x = (index: number) => points.length === 1 ? 250 : 12 + index / (points.length - 1) * 476;
  const y = (weight: number) => 212 - (weight - min) / (max - min) * 200;
  const coordinates = points.map((point, index) => `${x(index)},${y(point.weightKg)}`).join(" ");
  const ticks = [min, (min + max) / 2, max];

  return (
    <section aria-labelledby="weight-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="weight-title" className="text-lg font-semibold">Evolução do peso</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{periodLabel ?? "O histórico será exibido a partir dos registros de peso."}</p>
      {points.length === 0 ? <EmptyState description="Os registros de peso formarão sua linha do tempo. Nenhum valor foi estimado." /> : (
        <>
          <p className="mb-2 text-xs text-muted">Peso (kg)</p>
          <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2">
          <div aria-hidden="true" className="relative h-56 text-xs text-muted tabular-nums">
            {ticks.map((tick) => <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(tick) / 224 * 100}%` }}>{tick.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>)}
          </div>
          <svg viewBox="0 0 500 224" preserveAspectRatio="none" role="img" aria-labelledby="weight-svg-title weight-svg-description" className="block h-56 w-full text-primary">
            <title id="weight-svg-title">Peso registrado em quilogramas</title>
            <desc id="weight-svg-description">{points.length} registros. Eixo vertical em kg com escala de {min.toLocaleString("pt-BR")} a {max.toLocaleString("pt-BR")}. Valores completos na tabela abaixo. {demo ? "Demonstração — dados fictícios." : ""}</desc>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1="12" x2="488" y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray="4 6" />
              </g>
            ))}
            {points.length > 1 && <polyline points={coordinates} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
            {points.map((point, index) => <circle key={point.date} cx={x(index)} cy={y(point.weightKg)} r="4" fill="var(--primary)" />)}
          </svg>
          <div aria-hidden="true" className="col-start-2 mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted tabular-nums">
            {points.filter((_, index) => index === 0 || index === points.length - 1).map((point) => <time key={point.date} dateTime={point.date}>{point.date.split("-").reverse().join("/")}</time>)}
          </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{points.length === 1 ? "Um registro disponível. A evolução aparecerá com novos registros." : "A linha conecta os registros disponíveis; não representa medições entre eles."}</p>
          <details className="mt-5 rounded-lg border border-border px-4 py-3">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary">Ver dados em tabela</summary>
            <table className="mt-4 w-full text-left text-sm tabular-nums">
              <caption className="pb-3 text-left text-xs text-muted">{demo ? "Demonstração — dados fictícios. " : ""}Registros de peso em quilogramas.</caption>
              <thead><tr className="border-b border-border"><th scope="col" className="py-2 font-medium">Data</th><th scope="col" className="py-2 text-right font-medium">Peso (kg)</th></tr></thead>
              <tbody>{points.map((point) => <tr key={point.date} className="border-b border-border last:border-0"><th scope="row" className="py-2 font-normal"><time dateTime={point.date}>{point.date.split("-").reverse().join("/")}</time></th><td className="py-2 text-right">{point.weightKg.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</td></tr>)}</tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
