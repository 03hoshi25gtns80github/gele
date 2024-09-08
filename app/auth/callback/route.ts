"use server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("Debug: request.url", request.url);
  console.log("Debug: origin", origin);
  console.log("Debug: next", next);

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const host = request.headers.get("host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      console.log("Debug: forwardedHost", forwardedHost);
      console.log("Debug: forwardedProto", forwardedProto);
      console.log("Debug: host", host);
      console.log("Debug: isLocalEnv", isLocalEnv);

      let redirectUrl;
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost && forwardedProto) {
        redirectUrl = `${forwardedProto}://${forwardedHost}${next}`;
      } else {
        redirectUrl = `https://${host}${next}`;
      }

      console.log("Debug: redirectUrl", redirectUrl);

      return NextResponse.redirect(redirectUrl);
    }
  }

  // 認証コードがない、またはエラーが発生した場合は
  // エラーページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}