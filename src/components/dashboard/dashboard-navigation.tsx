const available = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Treinos", path: "/treinos" },
  { label: "Alimentação", path: "/alimentacao" },
  { label: "Sono", path: "/sono" },
  { label: "Peso & Medidas", path: "/medidas" },
] as const;

export function DashboardNavigation({ activePath = "/dashboard", demo = false }: {
  activePath?: "/dashboard" | "/treinos" | "/alimentacao" | "/sono" | "/medidas";
  demo?: boolean;
}) {
  return (
    <nav aria-label="Navegação principal">
      <ul className="grid min-w-0 grid-cols-6 gap-1 sm:grid-cols-5 sm:gap-2 lg:grid-cols-1">
        {available.map((item, index) => (
          <li key={item.path} className={`min-w-0 sm:col-span-1 ${index < 3 ? "col-span-2" : "col-span-3"}`}>
            <a href={demo ? `${item.path}?view=demo` : item.path} aria-current={activePath === item.path ? "page" : undefined} className={`flex h-full min-h-11 min-w-0 items-center justify-center rounded-lg border px-1.5 py-2 text-center text-xs font-medium break-words whitespace-normal sm:px-3 sm:text-sm lg:min-h-12 lg:justify-start lg:text-left ${activePath === item.path ? "border-primary/30 bg-primary/10 text-primary" : "border-transparent text-muted hover:bg-primary/10 hover:text-foreground"}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
