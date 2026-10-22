import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DashboardNavigation } from "./dashboard-navigation";

export function DashboardShell({ demo, periodLabel, children, activePath = "/dashboard", title = "Meu Dashboard", description = "Seu espaço de performance está sendo preparado", eyebrow = "Visão geral", compact = false, modeLinks }: {
  demo: boolean;
  periodLabel: string | null;
  children: ReactNode;
  activePath?: "/dashboard" | "/treinos" | "/alimentacao" | "/sono" | "/medidas";
  title?: string;
  description?: string;
  eyebrow?: string;
  compact?: boolean;
  modeLinks?: Readonly<{ personal: string; demo: string }>;
}) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-background">
        Pular para o conteúdo
      </a>
      <aside className={`border-b border-border bg-surface px-4 pb-1 sm:px-6 lg:min-h-svh lg:border-r lg:border-b-0 lg:py-8 ${compact ? "pt-3 sm:pt-4" : "pt-4"}`}>
        <header className={compact ? "mb-2 sm:mb-3 lg:mb-10" : "mb-3 lg:mb-10"}>
          <BrandLogo variant="horizontal" compact />
        </header>
        <DashboardNavigation activePath={activePath} demo={demo} />
        <p className="mt-8 hidden text-xs leading-relaxed text-muted lg:block">Train. Measure. Evolve.</p>
      </aside>

      <main id="dashboard-content" tabIndex={-1} className={`mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-7 sm:py-8 xl:px-10 ${compact ? "py-3" : "py-5"}`}>
        <header className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 border-b border-border sm:mb-6 sm:pb-6 ${compact ? "mb-3 gap-y-2 pb-3 sm:gap-y-3" : "mb-5 gap-y-3 pb-5"}`}>
          <div className="min-w-0">
            <p className={`text-xs font-medium tracking-[0.12em] text-primary uppercase ${compact ? "mb-1 sm:mb-2" : "mb-2"}`}>{eyebrow}</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          </div>
          <div className="w-24 sm:w-28"><LogoutButton /></div>
          <p className="col-span-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        </header>

        <section aria-label="Modo de visualização" className={`rounded-xl border border-border bg-surface sm:mb-6 sm:px-5 sm:py-4 ${compact ? "mb-3 px-3 py-2" : "mb-5 px-4 py-3"}`}>
          <div className={`flex flex-wrap items-center justify-between ${compact ? "gap-x-3 gap-y-2 sm:gap-x-5 sm:gap-y-3" : "gap-x-5 gap-y-3"}`}>
            <div className="min-w-0 flex-1 basis-56">
              <p className="text-sm font-medium text-primary">{demo ? "Demonstração — dados fictícios" : "Seu acompanhamento"}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {demo ? compact ? <><span className="hidden sm:inline">Período ilustrativo fixo: </span>{periodLabel}<span className="hidden sm:inline">. Nenhum dado pessoal é exibido.</span></> : `Período ilustrativo fixo: ${periodLabel}. Nenhum dado pessoal é exibido.` : "Seus registros aparecerão aqui quando o acompanhamento estiver disponível."}
              </p>
            </div>
            <a href={demo ? modeLinks?.personal ?? activePath : modeLinks?.demo ?? `${activePath}?view=demo`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
              {demo ? "Sair da demonstração" : "Ver demonstração"}
            </a>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}
