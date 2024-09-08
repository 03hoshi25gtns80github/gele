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
      const host = request.headers.get("host") || process.env.NEXT_PUBLIC_SITE_URL || "gele-plus.vercel.app";
      const redirectUrl = `https://${host}${next}`;

      console.log("Debug: Final redirectUrl", redirectUrl);

      return NextResponse.redirect(redirectUrl);
    }
  }

  // エラーページにリダイレクト
  console.log("Debug: Redirecting to error page");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}