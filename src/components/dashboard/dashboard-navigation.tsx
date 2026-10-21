const upcoming = ["Medidas"] as const;
const available = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Treinos", path: "/treinos" },
  { label: "Alimentação", path: "/alimentacao" },
  { label: "Sono", path: "/sono" },
] as const;

export function DashboardNavigation({ activePath = "/dashboard", demo = false }: {
  activePath?: "/dashboard" | "/treinos" | "/alimentacao" | "/sono";
  demo?: boolean;
}) {
  return (
    <nav aria-label="Navegação principal">
      <ul className="grid min-w-0 grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 lg:grid-cols-1">
        {available.map((item) => (
          <li key={item.path} className="min-w-0">
            <a href={demo ? `${item.path}?view=demo` : item.path} aria-current={activePath === item.path ? "page" : undefined} className={`flex min-h-11 min-w-0 items-center justify-center rounded-lg border px-1.5 py-2 text-xs font-medium sm:px-3 sm:text-sm lg:min-h-12 lg:justify-start ${activePath === item.path ? "border-primary/30 bg-primary/10 text-primary" : "border-transparent text-muted hover:bg-primary/10 hover:text-foreground"}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
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
