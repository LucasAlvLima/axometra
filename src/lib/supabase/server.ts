import "server-only";

import {
  isAuthError,
  isAuthRetryableFetchError,
  isAuthSessionMissingError,
} from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ServerClientOptions = {
  cookieAccess?: "read-only" | "read-write";
};

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("O serviço de autenticação não está configurado.");
  }

  return { url, publishableKey };
}

/** Only definite session failures should be interpreted as signed out. */
export function isInvalidSessionError(error: unknown): boolean {
  if (!isAuthError(error)) return false;
  if (
    isAuthRetryableFetchError(error) ||
    error.status === 429 ||
    (error.status !== undefined && error.status >= 500)
  ) {
    return false;
  }

  return (
    isAuthSessionMissingError(error) ||
    error.name === "AuthInvalidJwtError" ||
    [
      "bad_jwt",
      "invalid_jwt",
      "session_not_found",
      "session_expired",
      "refresh_token_not_found",
      "refresh_token_already_used",
      "user_not_found",
      "user_banned",
    ].includes(error.code ?? "")
  );
}

/**
 * Create one client per request. Server Components use the read-only default;
 * Server Actions must opt into cookieAccess: "read-write" before auth mutations.
 * The Proxy persists refreshes before rendering, where cookies are read-only.
 */
export async function createClient({
  cookieAccess = "read-only",
}: ServerClientOptions = {}) {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (cookieAccess === "read-only") return;

        // Do not suppress persistence errors in Server Actions. Their response
        // headers are managed by Next.js; headers() is not a writable API.
        // The Proxy propagates the SSR cache headers on HTTP responses.
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
