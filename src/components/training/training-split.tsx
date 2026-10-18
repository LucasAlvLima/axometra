import type { TrainingData, TrainingSession } from "@/lib/training/types";
import { EmptyState } from "@/components/dashboard/empty-state";

export function TrainingSplit({ divisions, sessions, demo, periodLabel }: {
  divisions: TrainingData["divisions"];
  sessions: readonly TrainingSession[];
  demo: boolean;
  periodLabel: string | null;
}) {
  return (
    <section aria-labelledby="split-title" className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="split-title" className="text-lg font-semibold">Divisão registrada no período</h2>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{periodLabel ?? "As divisões aparecerão a partir das sessões registradas."}</p>
      {sessions.length === 0 ? <EmptyState description="Os agrupamentos de treinos serão exibidos aqui. Nenhuma rotina foi recomendada ou preenchida." /> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {divisions.map((division) => {
            const matching = sessions.filter((session) => session.divisionId === division.id);
            if (!matching.length) return null;
            return (
              <li key={division.id} className="rounded-lg border border-border p-4">
                <h3 className="font-medium">{division.label}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {matching.map((session) => <li key={session.id}><time dateTime={session.date}>{session.date.split("-").reverse().join("/")}</time></li>)}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
