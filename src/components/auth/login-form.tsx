"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { login } from "@/lib/auth/actions";
import { initialLoginState } from "@/lib/auth/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialLoginState);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.fieldErrors.email) emailRef.current?.focus();
    else if (state.fieldErrors.password) passwordRef.current?.focus();
    else messageRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} aria-busy={pending} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          readOnly={pending}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
          className="auth-input"
        />
        {state.fieldErrors.email && <p id="email-error" className="mt-2 text-sm text-foreground">{state.fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label>
        <div className="relative">
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            readOnly={pending}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(state.fieldErrors.password)}
            aria-describedby={state.fieldErrors.password ? "password-error" : undefined}
            className="auth-input pr-23"
          />
          <button
            type="button"
            aria-label="Mostrar senha"
            aria-pressed={showPassword}
            aria-controls="password"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-1 my-1 min-w-20 rounded-md px-3 text-xs font-medium text-primary hover:bg-primary/10"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {state.fieldErrors.password && <p id="password-error" className="mt-2 text-sm text-foreground">{state.fieldErrors.password}</p>}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.message && !pending && (
          <p ref={messageRef} tabIndex={-1} className="rounded-lg border border-primary/30 bg-background/50 px-4 py-3 text-sm leading-relaxed">
            {state.message}
          </p>
        )}
        {pending && <p className="sr-only">Validando seus dados de acesso.</p>}
      </div>
      <button type="submit" disabled={pending} className="auth-button">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
