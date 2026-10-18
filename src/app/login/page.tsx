import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthenticationUnavailableError, getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Entrar | AXOMETRA" };

async function LoginAccess() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error: unknown) {
    if (!(error instanceof AuthenticationUnavailableError)) throw error;
    return (
      <div className="space-y-5" role="status">
        <p className="text-sm leading-relaxed text-muted">
          O acesso está temporariamente indisponível. Tente novamente em instantes.
        </p>
        <a className="auth-button flex items-center justify-center" href="/login">
          Tentar novamente
        </a>
      </div>
    );
  }
  if (user) redirect("/dashboard");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <BrandLogo variant="stacked" />
        </header>
        <section aria-labelledby="login-title" className="rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/15 sm:p-9">
          <p className="mb-3 text-xs font-medium tracking-[0.16em] text-primary uppercase">
            Seu espaço de evolução
          </p>
          <h1 id="login-title" className="text-2xl font-semibold tracking-tight">
            Boas-vindas.
          </h1>
          <p className="mt-3 mb-8 text-sm leading-relaxed text-muted">
            Entre para acompanhar sua performance.
          </p>
          <Suspense fallback={<p role="status" className="py-6 text-sm text-muted">Verificando acesso…</p>}>
            <LoginAccess />
          </Suspense>
        </section>
        <p className="mt-7 text-center text-xs leading-relaxed text-muted">
          Área de acesso pessoal
          <span aria-hidden="true" className="mx-2">·</span>
          Train. Measure. Evolve.
        </p>
      </div>
    </main>
  );
}
