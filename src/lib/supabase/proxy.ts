import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig, isInvalidSessionError } from "./server";

const CACHE_HEADERS = ["cache-control", "expires", "pragma"] as const;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");

  // Recreating a response must preserve every cookie, including cookie chunks
  // and deletions, and the headers supplied with the first SSR cookie write.
  function withSessionState(target: NextResponse) {
    for (const cookie of response.cookies.getAll()) {
      target.cookies.set(cookie);
    }
    for (const name of CACHE_HEADERS) {
      const value = response.headers.get(name);
      if (value !== null) target.headers.set(name, value);
    }
    return target;
  }

  function unavailable() {
    const target = new NextResponse(
      "Autenticação temporariamente indisponível. Tente novamente.",
      { status: 503, headers: { "Retry-After": "30" } },
    );
    return withSessionState(target);
  }

  let hasIdentity = false;

  try {
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = withSessionState(NextResponse.next({ request }));

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        },
      },
    });

    // Validate/refresh before rendering. Raw getSession() data is not trusted.
    const { data, error } = await supabase.auth.getClaims();
    if (error && !isInvalidSessionError(error)) return unavailable();
    hasIdentity = !error && Boolean(data?.claims.sub);
  } catch (error: unknown) {
    if (!isInvalidSessionError(error)) return unavailable();
  }

  const pathname = request.nextUrl.pathname;
  const isProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/") ||
    pathname === "/treinos" || pathname.startsWith("/treinos/") ||
    pathname === "/alimentacao" || pathname.startsWith("/alimentacao/");

  if (isProtected && !hasIdentity) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return withSessionState(NextResponse.redirect(loginUrl));
  }

  // /login must use the server user check before redirecting to /dashboard;
  // a still-valid JWT alone does not establish the user's current Auth status.
  return response;
}
