"use server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next"パラメータがある場合はそれをリダイレクト先として使用し、
  // ない場合はデフォルトで"/"にリダイレクト
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const isLocalEnv = process.env.NODE_ENV === "development";

      let redirectUrl;
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}${next}`;
      } else {
        redirectUrl = `https://${request.headers.get("host")}${next}`;
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // 認証コードがない、またはエラーが発生した場合は
  // エラーページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}