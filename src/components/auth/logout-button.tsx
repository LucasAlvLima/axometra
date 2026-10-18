"use client";

import { useActionState, useEffect, useRef } from "react";

import { logout } from "@/lib/auth/actions";
import { initialLogoutState } from "@/lib/auth/types";

export function LogoutButton() {
  const [state, formAction, pending] = useActionState(logout, initialLogoutState);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "error") messageRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} aria-busy={pending} className="w-full space-y-3 sm:max-w-64">
      <button type="submit" disabled={pending} className="auth-button">
        {pending ? "Saindo…" : "Sair"}
      </button>
      <div aria-live="polite" aria-atomic="true">
        {pending && <p className="sr-only">Encerrando seu acesso.</p>}
        {state.message && !pending && (
          <p ref={messageRef} tabIndex={-1} className="rounded-lg border border-primary/30 bg-background/50 px-4 py-3 text-sm leading-relaxed">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
