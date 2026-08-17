import { NextResponse } from "next/server";

import { PASSWORD_RECOVERY_COOKIE, PASSWORD_RECOVERY_MAX_AGE } from "@/lib/password-recovery";
import { safeInternalPath } from "@/lib/input-validation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = safeInternalPath(requestedNext, "/buscar");

  if (code && code.length <= 4096 && !/[\u0000-\u001f\u007f]/u.test(code)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, url.origin));
      if (next === "/redefinir-senha") {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
          httpOnly: true,
          sameSite: "lax",
          secure: url.protocol === "https:",
          path: "/",
          maxAge: PASSWORD_RECOVERY_MAX_AGE,
        });
      }
      return response;
    }
  }

  const errorPath = next === "/redefinir-senha"
    ? "/login?modo=recuperar&erro=link-expirado"
    : "/login?erro=confirmacao";
  return NextResponse.redirect(new URL(errorPath, url.origin));
}
