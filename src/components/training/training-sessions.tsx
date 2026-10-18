import type { TrainingData, TrainingSession, TrainingSessionSummary } from "@/lib/training/types";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ExerciseSets, volumeDescription } from "./exercise-sets";

const statuses = { planned: "Planejada", "in-progress": "Em andamento", completed: "Concluída" } as const;

export function TrainingSessions({ sessions, summaries, divisions, demo, periodLabel }: {
  sessions: readonly TrainingSession[];
  summaries: readonly TrainingSessionSummary[];
  divisions: TrainingData["divisions"];
  demo: boolean;
  periodLabel: string | null;
}) {
  return (
    <section aria-labelledby="sessions-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="sessions-title" className="text-lg font-semibold">Sessões registradas</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{periodLabel ?? "As sessões aparecerão aqui quando o acompanhamento estiver disponível."}</p>
      {sessions.length === 0 ? <EmptyState description="Seu histórico reunirá sessões e exercícios. Nenhum treino ou dia de descanso foi presumido." /> : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const summary = summaries.find((item) => item.id === session.id);
            if (!summary) return null;
            return (
              <details key={session.id} className="min-w-0 rounded-xl border border-border bg-background/40 p-4 sm:p-5">
                <summary className="min-h-11 cursor-pointer py-2 text-base font-medium leading-relaxed">
                  <time dateTime={session.date}>{session.date.split("-").reverse().join("/")}</time> · {divisions.find((division) => division.id === session.divisionId)?.label ?? "Divisão não informada"} · {statuses[session.status]}
                </summary>
                {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
                <h3 className="mt-5 text-sm font-semibold">Exercícios da sessão</h3>
                <p className="mt-2 text-sm text-muted">{summary.completedWorkSets} séries de trabalho concluídas · {summary.externalVolume.value === null ? "Volume não quantificado" : `${summary.externalVolume.value.toLocaleString("pt-BR")} kg·rep`}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{volumeDescription(summary.externalVolume)}</p>
                <div className="mt-5 space-y-4">
                  {session.exercises.length === 0 && <p className="text-sm text-muted">Sem exercícios registrados.</p>}
                  {session.exercises.map((exercise) => {
                    const exerciseSummary = summary.exercises.find((item) => item.id === exercise.id);
                    return exerciseSummary ? <ExerciseSets key={exercise.id} exercise={exercise} summary={exerciseSummary} demo={demo} date={session.date} /> : null;
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
