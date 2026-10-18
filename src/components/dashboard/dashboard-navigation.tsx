const upcoming = ["Sono", "Medidas"] as const;
const available = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Treinos", path: "/treinos" },
  { label: "Alimentação", path: "/alimentacao" },
] as const;

export function DashboardNavigation({ activePath = "/dashboard", demo = false }: {
  activePath?: "/dashboard" | "/treinos" | "/alimentacao";
  demo?: boolean;
}) {
  return (
    <nav aria-label="Navegação principal">
      <ul className="grid grid-cols-3 gap-1 sm:gap-2 lg:grid-cols-1">
        {available.map((item) => (
          <li key={item.path}>
            <a href={demo ? `${item.path}?view=demo` : item.path} aria-current={activePath === item.path ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded-lg border px-1.5 py-2 text-xs font-medium sm:px-3 sm:text-sm lg:min-h-12 lg:justify-start ${activePath === item.path ? "border-primary/30 bg-primary/10 text-primary" : "border-transparent text-muted hover:bg-primary/10 hover:text-foreground"}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <details className="mt-1 lg:hidden">
        <summary className="min-h-11 cursor-pointer rounded-lg px-2 py-3 text-xs font-medium text-muted">Em breve</summary>
        <ul className="grid grid-cols-2 gap-2 pb-2">
          {upcoming.map((label) => <li key={label} className="rounded-lg border border-border px-3 py-2 text-sm text-muted"><span aria-disabled="true">{label} · Em breve</span></li>)}
        </ul>
      </details>
      <ul className="mt-2 hidden space-y-2 lg:block">
        {upcoming.map((label) => (
          <li key={label}>
            <span aria-disabled="true" className="flex min-h-12 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg px-3 py-3 text-sm text-muted">
              <span>{label}</span>
              <span className="text-xs">Em breve</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
