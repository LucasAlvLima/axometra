import { useId } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import type { SleepData, SleepIssue, SleepRecord, SleepRecordAnalysis, SleepSummary } from "@/lib/sleep/types";

const issueLabels: Record<SleepIssue, string> = {
  "missing-start": "Início não informado",
  "missing-wake": "Despertar não informado",
  "invalid-start": "Início inválido",
  "invalid-wake": "Despertar inválido",
  "nonpositive-window": "Despertar não posterior ao início",
  "window-over-24h": "Janela acima do limite técnico de 24 horas",
  "invalid-quality": "Avaliação fora da escala de 1 a 5",
  "invalid-observation": "Observação em formato inválido",
  "same-night-conflict": "Mais de um registro na mesma data de despertar",
  "overlapping-window": "Janela sobreposta a outro registro",
};

function durationLabel(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}min`;
}

function instantLabel(value: string | null, invalid: boolean, timeZone: SleepData["timeZone"]): string {
  if (value === null) return "Não informado";
  if (invalid) return "Inválido; data não formatada";
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) return "Inválido; data não formatada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone, timeZoneName: "shortOffset", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(instant);
}

function SleepEntry({ record, analysis, demo, timeZone }: {
  record: SleepRecord;
  analysis: SleepRecordAnalysis;
  demo: boolean;
  timeZone: SleepData["timeZone"];
}) {
  return (
    <details className="min-w-0 rounded-xl border border-border bg-background/40 p-4 sm:p-5">
      <summary className="min-h-11 cursor-pointer py-2 text-sm leading-relaxed">
        <span className="font-semibold">{analysis.wakeDate === null ? "Registro sem noite classificável" : <time dateTime={analysis.wakeDate}>{analysis.wakeDate.split("-").reverse().join("/")}</time>}</span>
        <span className="mt-1 block text-muted">{analysis.durationIncluded && analysis.windowMinutes !== null ? `Janela incluída: ${durationLabel(analysis.windowMinutes)}` : "Janela não incluída nos indicadores"}</span>
        <span className="mt-1 block text-muted">Qualidade: {analysis.quality === null ? analysis.issues.includes("invalid-quality") ? "avaliação inválida" : "não informada" : `${analysis.quality} / 5 · ${analysis.qualityIncluded ? "incluída na média" : "não incluída na média"}`}</span>
        {demo && <span className="mt-2 block text-xs text-primary">Demonstração — dados fictícios</span>}
      </summary>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Início declarado</dt><dd className="mt-1 [overflow-wrap:anywhere]">{instantLabel(record.startedAt, analysis.issues.includes("invalid-start"), timeZone)}</dd></div>
        <div><dt className="text-muted">Despertar declarado</dt><dd className="mt-1 [overflow-wrap:anywhere]">{instantLabel(record.wokeAt, analysis.issues.includes("invalid-wake"), timeZone)}</dd></div>
        <div><dt className="text-muted">Janela declarada</dt><dd className="mt-1">{analysis.windowMinutes === null ? "Não disponível" : `${durationLabel(analysis.windowMinutes)}${analysis.durationIncluded ? " · incluída" : " · candidata excluída dos indicadores e do gráfico"}`}</dd></div>
        <div><dt className="text-muted">Fuso dos horários apresentados</dt><dd className="mt-1 [overflow-wrap:anywhere]">{timeZone}</dd></div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted">Janela declarada, não sono efetivo. A inclusão da qualidade é independente da validade da duração; conflitos impedem inclusão nas médias.</p>
      {analysis.issues.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">Pendências do registro</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-muted">{analysis.issues.map((issue) => <li key={issue}>{issueLabels[issue]}</li>)}</ul>
        </div>
      ) : <p className="mt-4 text-sm text-muted">Sem pendências de dados identificadas.</p>}
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm font-medium">Observações</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">{typeof record.observation === "string" ? record.observation : analysis.issues.includes("invalid-observation") ? "Observação inválida." : "Sem observações."}</p>
      </div>
    </details>
  );
}

export function SleepRecords({ data, summary, demo, periodLabel }: {
  data: SleepData;
  summary: SleepSummary;
  demo: boolean;
  periodLabel: string | null;
}) {
  const id = useId();
  const selected = summary.records.filter((record) => record.inPeriod);
  const unassigned = summary.records.filter((record) => record.wakeDate === null);
  const outside = summary.records.filter((record) => !record.inPeriod && record.wakeDate !== null);
  const renderEntries = (records: readonly SleepRecordAnalysis[]) => records.map((analysis) => {
    const record = data.records.find((item) => item.id === analysis.id);
    return record ? <li key={analysis.id} className="min-w-0"><SleepEntry record={record} analysis={analysis} demo={demo} timeZone={data.timeZone} /></li> : null;
  });

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">Histórico de sono</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 text-sm leading-relaxed text-muted">{periodLabel ?? "O período será exibido a partir dos registros."}</p>
      <p className="mt-3 mb-6 text-xs leading-relaxed text-muted">Data de referência: despertar local em {data.timeZone}. Pendências indicam qualidade dos dados, não avaliação clínica.</p>
      {data.records.length === 0 ? <EmptyState description="O histórico reunirá janelas declaradas, avaliações subjetivas e observações quando houver registros." /> : (
        <>
          {selected.length > 0 ? <ul className="grid min-w-0 gap-4 xl:grid-cols-2">{renderEntries(selected)}</ul> : <p className="text-sm leading-relaxed text-muted">Nenhum registro foi atribuído ao período selecionado. Isso não significa que os dados fornecidos estejam vazios.</p>}
          {outside.length > 0 && <p className="mt-5 text-sm leading-relaxed text-muted">{outside.length} registros com data classificável fora do período não são exibidos neste histórico nem no gráfico.</p>}
          {unassigned.length > 0 && (
            <section aria-labelledby={`${id}-unassigned`} className="mt-7 border-t border-border pt-6">
              <h3 id={`${id}-unassigned`} className="text-base font-semibold">Registros sem noite classificável</h3>
              {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
              <p className="mt-2 mb-4 text-sm leading-relaxed text-muted">{unassigned.length} registros não podem ser associados ao período porque o despertar está ausente ou inválido. Aparecem aqui para consulta, sem entrar nos indicadores ou no gráfico.</p>
              <ul className="grid min-w-0 gap-4 xl:grid-cols-2">{renderEntries(unassigned)}</ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}
