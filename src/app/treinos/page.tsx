import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard, type PresentationMetric } from "@/components/dashboard/metric-card";
import { volumeDescription } from "@/components/training/exercise-sets";
import { TrainingSessions } from "@/components/training/training-sessions";
import { TrainingSplit } from "@/components/training/training-split";
import { AuthenticationUnavailableError, requireUser } from "@/lib/auth/session";
import { demoTraining, emptyTraining } from "@/lib/training/demo";
import { summarizeTraining } from "@/lib/training/summary";
import type { TrainingData } from "@/lib/training/types";

export const metadata: Metadata = { title: "Treinos | AXOMETRA" };

type TrainingPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function TrainingContent({ searchParams }: TrainingPageProps) {
  try {
    await requireUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;
    return (
      <main className="mx-auto my-10 w-full max-w-3xl px-5">
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
          <h1 className="text-2xl font-semibold">Acesso temporariamente indisponível</h1>
          <p role="status" className="mt-4 text-sm leading-relaxed text-muted">Não foi possível verificar seu acesso. Tente novamente em instantes.</p>
          <a href="/treinos" className="auth-button mt-6 inline-flex items-center justify-center sm:w-auto">Tentar novamente</a>
        </section>
      </main>
    );
  }

  const demo = (await searchParams).view === "demo";
  const data: TrainingData = demo ? demoTraining : emptyTraining;
  const summary = summarizeTraining(data);
  const sessions = data.sessions.filter((session) => summary.sessions.some((item) => item.id === session.id));
  const periodLabel = data.period ? `${data.period.startDate.split("-").reverse().join("/")} a ${data.period.endDate.split("-").reverse().join("/")} · America/Sao_Paulo` : null;
  const volume = summary.externalVolume;
  const metrics: PresentationMetric[] = [
    { id: "training-sessions", label: "Sessões concluídas", value: summary.completedSessions?.toLocaleString("pt-BR") ?? null, unit: "sessões", detail: periodLabel ?? "O total do período aparecerá com os registros." },
    { id: "training-sets", label: "Séries de trabalho concluídas", value: summary.completedWorkSets?.toLocaleString("pt-BR") ?? null, unit: "séries", detail: "Somente sessões concluídas; aquecimento excluído." },
    { id: "training-volume", label: volume.completeness === "partial" ? "Volume externo parcial" : "Volume externo registrado", value: volume.value === null ? sessions.length ? "Não quantificado" : null : volume.value.toLocaleString("pt-BR"), unit: volume.value === null ? "" : volume.unit, detail: volumeDescription(volume) },
  ];

  return (
    <DashboardShell demo={demo} periodLabel={periodLabel} activePath="/treinos" title="Treinos" eyebrow="Seu treinamento" description="Sessões, exercícios e volume externo registrado em um só lugar.">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} demo={demo} />)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">Volume em kg·rep: repetições e carga externa total das séries de trabalho concluídas. Peso corporal e movimentos assistidos não são convertidos; esforços com dados ausentes tornam o subtotal parcial.</p>
      <div className="mt-6 space-y-6">
        <TrainingSplit divisions={data.divisions} sessions={sessions} demo={demo} periodLabel={periodLabel} />
        <TrainingSessions sessions={sessions} summaries={summary.sessions} divisions={data.divisions} demo={demo} periodLabel={periodLabel} />
      </div>
    </DashboardShell>
  );
}

export default function TrainingPage({ searchParams }: TrainingPageProps) {
  return (
    <Suspense fallback={<main className="px-5 py-10"><p role="status" className="text-sm text-muted">Verificando acesso…</p></main>}>
      <TrainingContent searchParams={searchParams} />
    </Suspense>
  );
}
