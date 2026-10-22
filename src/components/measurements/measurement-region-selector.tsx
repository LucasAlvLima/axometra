import { MEASUREMENT_REGIONS, type MeasurementRegion } from "@/lib/measurements/types";
import { measurementRegionHref, regionLabels } from "@/lib/measurements/view";

export function MeasurementRegionSelector({ region, demo }: { region: MeasurementRegion; demo: boolean }) {
  return (
    <details className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Região: {regionLabels[region]} <span className="text-muted">· alterar</span></summary>
      <nav aria-label="Selecionar região corporal" className="mt-3">
        <ul className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {MEASUREMENT_REGIONS.map((item) => <li key={item} className="min-w-0"><a href={measurementRegionHref(item, demo)} aria-current={item === region ? "true" : undefined} className={`flex min-h-11 h-full items-center rounded-lg border px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${item === region ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-primary/5"}`}>{regionLabels[item]}</a></li>)}
        </ul>
      </nav>
      <p className="mt-3 text-xs leading-relaxed text-muted">A seleção altera somente o gráfico regional. Os indicadores acima continuam mostrando peso e cintura.</p>
    </details>
  );
}
