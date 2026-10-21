import { useId } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import type { SleepData, SleepSummary } from "@/lib/sleep/types";

function durationLabel(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}min`;
}

export function SleepDurationChart({ data, summary, demo, periodLabel }: {
  data: SleepData;
  summary: SleepSummary;
  demo: boolean;
  periodLabel: string | null;
}) {
  const id = useId();
  // Calendar positions only; eligibility and window durations are supplied by analysis.
  const start = data.period === null ? null : Date.parse(`${data.period.startDate}T00:00:00Z`);
  const rows = start === null ? [] : Array.from({ length: summary.coverage.periodNights ?? 0 }, (_, index) => {
    const date = new Date(start + index * 86_400_000).toISOString().slice(0, 10);
    const records = summary.records.filter((record) => record.inPeriod && record.wakeDate === date);
    const eligible = records.filter((record) => record.durationIncluded && record.windowMinutes !== null);
    return {
      date,
      minutes: eligible.length === 1 ? eligible[0].windowMinutes : null,
      status: records.length === 0 ? "Sem registro" : eligible.length === 1 ? "Janela incluída" : "Janela não elegível",
    };
  });
  const maximumHours = Math.max(1, Math.ceil(Math.max(0, ...rows.map((row) => row.minutes ?? 0)) / 60));
  const ticks = [0, maximumHours / 2, maximumHours];
  const y = (hours: number) => 212 - hours / maximumHours * 200;
  const slot = rows.length ? 500 / rows.length : 500;

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">Duração da janela por noite</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 text-sm leading-relaxed text-muted">{periodLabel ?? "O período será exibido quando houver registros."}</p>
      <p className="mt-3 mb-5 text-xs leading-relaxed text-muted">Horas da janela declarada, não sono efetivo. A noite corresponde à data local de despertar em {data.timeZone}.</p>
      {rows.length === 0 ? <EmptyState description="O gráfico mostrará as janelas válidas por noite. Ausência de registro não será preenchida com zero." /> : (
        <>
          <p className="mb-2 text-xs text-muted">Janela registrada (horas)</p>
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
            <div aria-hidden="true" className="relative h-56 text-xs text-muted tabular-nums">
              {ticks.map((tick) => <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(tick) / 224 * 100}%` }}>{tick.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h</span>)}
            </div>
            <svg viewBox="0 0 500 224" preserveAspectRatio="none" role="img" aria-labelledby={`${id}-title ${id}-description`} className="block h-56 w-full text-primary">
              <title id={`${id}-title`}>Duração das janelas registradas por data de despertar</title>
              <desc id={`${id}-description`}>Barras em horas, com escala de zero a {maximumHours}. Somente janelas elegíveis no período são representadas. Cruzes indicam ausência de valor elegível, nunca duração zero. A tabela abaixo distingue ausência de registro e janela não elegível. {demo ? "Demonstração — dados fictícios." : ""}</desc>
              {ticks.map((tick) => <line key={tick} x1="0" x2="500" y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray="4 6" />)}
              {rows.map((row, index) => {
                const center = (index + 0.5) * slot;
                return row.minutes === null ? (
                  <path key={row.date} d={`M ${center - 5} 105 L ${center + 5} 115 M ${center - 5} 115 L ${center + 5} 105`} stroke="var(--muted)" strokeWidth="2" />
                ) : (
                  <rect key={row.date} x={center - slot * 0.28} y={y(row.minutes / 60)} width={slot * 0.56} height={212 - y(row.minutes / 60)} rx="3" fill="currentColor" />
                );
              })}
            </svg>
            <div aria-hidden="true" className="col-start-2 mt-2 grid text-center text-xs text-muted tabular-nums" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
              {rows.map((row) => <time key={row.date} dateTime={row.date}>{row.date.slice(8)}</time>)}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">Eixo horizontal: dia do despertar. × significa sem valor elegível; consulte datas e estados na tabela e os motivos no histórico.</p>
          <details className="mt-5 rounded-lg border border-border px-4 py-3">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-primary">Ver janelas e estados em tabela</summary>
            <div role="region" aria-label="Tabela de janelas; rolagem horizontal quando necessária" tabIndex={0} className="mt-3 max-w-full overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-sm tabular-nums">
                <caption className="pb-3 text-left text-xs leading-relaxed text-muted">{demo ? "Demonstração — dados fictícios. " : ""}{periodLabel}. Janela declarada em horas e minutos, não sono efetivo.</caption>
                <thead><tr className="border-b border-border"><th scope="col" className="p-2 font-medium">Despertar (data local)</th><th scope="col" className="p-2 font-medium">Janela (h/min)</th><th scope="col" className="p-2 font-medium">Estado</th></tr></thead>
                <tbody>{rows.map((row) => <tr key={row.date} className="border-b border-border last:border-0"><th scope="row" className="p-2 font-normal"><time dateTime={row.date}>{row.date.split("-").reverse().join("/")}</time></th><td className="p-2">{row.minutes === null ? "Não disponível" : durationLabel(row.minutes)}</td><td className="p-2">{row.status}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
