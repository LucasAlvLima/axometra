"use server";

import { isAuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { LoginActionState, LogoutActionState } from "./types";

const LOGIN_UNAVAILABLE =
  "Não foi possível entrar agora. Tente novamente em instantes.";
const LOGIN_REJECTED = "Não foi possível entrar com esses dados.";
const LOGOUT_UNCONFIRMED =
  "Não foi possível confirmar a saída. Tente novamente.";
const RATE_LIMITED =
  "Muitas tentativas. Aguarde um momento e tente novamente.";

function isRateLimited(error: unknown): boolean {
  return (
    isAuthError(error) &&
    (error.status === 429 || error.code === "over_request_rate_limit")
  );
}

function loginErrorMessage(error: unknown): string {
  if (isRateLimited(error)) return RATE_LIMITED;

  if (
    isAuthError(error) &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500 &&
    (error.name === "AuthInvalidCredentialsError" ||
      [
        "invalid_credentials",
        "email_not_confirmed",
        "phone_not_confirmed",
        "user_not_found",
        "user_banned",
        "email_address_invalid",
      ].includes(error.code ?? ""))
  ) {
    // Account existence, confirmation and restrictions share the same message.
    return LOGIN_REJECTED;
  }

  return LOGIN_UNAVAILABLE;
}

function loginFailure(message: string): LoginActionState {
  return { status: "error", message, fieldErrors: {} };
}

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!(formData instanceof FormData)) {
    return loginFailure("Não foi possível processar o formulário. Tente novamente.");
  }

  // Do not accept files or ambiguous duplicate fields from direct POST calls.
  const emails = formData.getAll("email");
  const passwords = formData.getAll("password");
  const email =
    emails.length === 1 && typeof emails[0] === "string"
      ? emails[0].trim()
      : null;
  const password =
    passwords.length === 1 && typeof passwords[0] === "string"
      ? passwords[0]
      : null;

  const fieldErrors: LoginActionState["fieldErrors"] = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Informe um email válido.";
  }
  // Login must accept existing passwords, including whitespace and short ones.
  if (password === null || password.length === 0) {
    fieldErrors.password = "Informe sua senha.";
  }

  if (Object.keys(fieldErrors).length > 0 || email === null || password === null) {
    return {
      status: "error",
      message: "Revise os campos indicados.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient({ cookieAccess: "read-write" });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return loginFailure(loginErrorMessage(error));
    if (!data.user || !data.session) return loginFailure(LOGIN_UNAVAILABLE);
  } catch (error: unknown) {
    return loginFailure(loginErrorMessage(error));
  }

  // Invalidate previously visited authenticated UI after changing identity.
  revalidatePath("/", "layout");
  redirect("/dashboard", RedirectType.replace);
}

export async function logout(
  _previousState: LogoutActionState,
  formData: FormData,
): Promise<LogoutActionState> {
  if (!(formData instanceof FormData)) {
    return { status: "error", message: LOGOUT_UNCONFIRMED };
  }

  try {
    const supabase = await createClient({ cookieAccess: "read-write" });
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      return {
        status: "error",
        message: isRateLimited(error) ? RATE_LIMITED : LOGOUT_UNCONFIRMED,
      };
    }
  } catch (error: unknown) {
    return {
      status: "error",
      message: isRateLimited(error) ? RATE_LIMITED : LOGOUT_UNCONFIRMED,
    };
  }

  revalidatePath("/", "layout");
  redirect("/login", RedirectType.replace);
}
