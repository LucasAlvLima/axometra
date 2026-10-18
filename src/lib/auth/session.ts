import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient, isInvalidSessionError } from "@/lib/supabase/server";

export type AuthenticatedUser = Readonly<{ id: string }>;

export class AuthenticationUnavailableError extends Error {
  constructor() {
    super("Autenticação temporariamente indisponível. Tente novamente.");
    this.name = "AuthenticationUnavailableError";
  }
}

/**
 * Request-time verification with Auth, returning no session tokens.
 * With Cache Components enabled, consume this in an async Server Component
 * beneath Suspense. Never put this read inside a use cache scope or a singleton.
 * Actions/Handlers must call it themselves before accessing protected data.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  // Session cookies can resolve during runtime prerendering. Supabase reads
  // the clock to check expiry, so verify Auth only on a real user request.
  await connection();

  // Keep Next.js request API calls outside the catch: prerender control-flow
  // errors from cookies() must propagate to the framework unchanged.
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (isInvalidSessionError(error)) return null;
      throw new AuthenticationUnavailableError();
    }

    return data.user ? { id: data.user.id } : null;
  } catch (error: unknown) {
    if (isInvalidSessionError(error)) return null;
    throw new AuthenticationUnavailableError();
  }
}

/** Recheck at each protected page/data entry point; a layout alone is not a guard. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
