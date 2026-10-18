import type { TrainingExercise, TrainingExerciseSummary, TrainingLoad, TrainingVolume } from "@/lib/training/types";

export function volumeDescription(volume: TrainingVolume): string {
  const coverage = volume.completeness === "partial" ? "Subtotal parcial" : volume.completeness === "complete" ? "Volume externo completo" : "Sem volume externo quantificável";
  return `${coverage}. Esforços: ${volume.includedCount} incluídos, ${volume.missingCount} sem dados suficientes, ${volume.excludedCount} excluídos (peso corporal/assistido).`;
}

function loadLabel(load: TrainingLoad): string {
  if (load.kind === "bodyweight") return "Peso corporal; não convertido em kg";
  if (load.kind === "assisted") return load.assistanceKg === null ? "Assistido; assistência não informada" : `Assistido; ${load.assistanceKg.toLocaleString("pt-BR")} kg de assistência`;
  return load.totalKg === null ? "Carga externa não informada" : `${load.totalKg.toLocaleString("pt-BR")} kg externos totais`;
}

const sides = { both: "Simultâneo", left: "Esquerdo", right: "Direito" } as const;

export function ExerciseSets({ exercise, summary, demo, date }: {
  exercise: TrainingExercise;
  summary: TrainingExerciseSummary;
  demo: boolean;
  date: string;
}) {
  return (
    <section aria-labelledby={`exercise-${exercise.id}`} className="min-w-0 rounded-xl border border-border p-4 sm:p-5">
      <h4 id={`exercise-${exercise.id}`} className="text-base font-semibold">{exercise.name}</h4>
      {demo && <p className="mt-2 text-xs text-primary">Demonstração — dados fictícios</p>}
      <p className="mt-3 text-sm text-foreground">
        {summary.completedWorkSets} séries de trabalho concluídas · Volume: {summary.externalVolume.value === null ? "não quantificado" : `${summary.externalVolume.value.toLocaleString("pt-BR")} kg·rep`}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{volumeDescription(summary.externalVolume)}</p>
      {exercise.sets.length === 0 ? <p className="mt-4 text-sm text-muted">Sem séries registradas.</p> : (
        <div role="region" aria-label={`Séries de ${exercise.name}; tabela com rolagem horizontal`} tabIndex={0} className="mt-4 max-w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[36rem] text-left text-sm tabular-nums">
            <caption className="pb-3 text-left text-xs leading-relaxed text-muted">{demo ? "Demonstração — dados fictícios. " : ""}{date.split("-").reverse().join("/")} · Carga simultânea inclui a barra completa ou ambos os halteres; unilateral informa cada lado.</caption>
            <thead><tr className="border-b border-border text-muted"><th scope="col" className="p-2 font-medium">Série / estado</th><th scope="col" className="p-2 font-medium">Lado / execução</th><th scope="col" className="p-2 font-medium">Repetições</th><th scope="col" className="p-2 font-medium">Carga / assistência</th></tr></thead>
            <tbody>
              {exercise.sets.map((set, index) => set.efforts.length === 0 ? (
                <tr key={set.id} className="border-b border-border"><th scope="row" className="p-2 font-normal">{index + 1} · {set.kind === "warmup" ? "Aquecimento" : "Trabalho"} · {set.completed ? "Concluída" : "Não concluída"}</th><td colSpan={3} className="p-2 text-muted">Sem esforços registrados</td></tr>
              ) : set.efforts.map((effort) => (
                <tr key={`${set.id}-${effort.side}`} className="border-b border-border last:border-0">
                  <th scope="row" className="p-2 font-normal">{index + 1} · {set.kind === "warmup" ? "Aquecimento" : "Trabalho"} · {set.completed ? "Concluída" : "Não concluída"}</th>
                  <td className="p-2">{sides[effort.side]}</td>
                  <td className="p-2">{effort.repetitions === null ? "Não informadas" : effort.repetitions.toLocaleString("pt-BR")}</td>
                  <td className="p-2">{loadLabel(effort.load)}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
