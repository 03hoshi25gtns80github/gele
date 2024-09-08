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
      // ロードバランサーを通過する前のオリジナルのホスト名を取得
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // ローカル環境では、ロードバランサーがないため、
        // X-Forwarded-Hostヘッダーを考慮する必要がない
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // 本番環境で、X-Forwarded-Hostヘッダーがある場合
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // その他の場合（本番環境でX-Forwarded-Hostがない場合など）
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 認証コードがない、またはエラーが発生した場合は
  // エラーページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}