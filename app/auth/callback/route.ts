"use server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  console.log("Debug: GET function started");
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("Debug: request.url", request.url);
  console.log("Debug: code", code ? "exists" : "not found");
  console.log("Debug: next", next);
  console.log("Debug: NODE_ENV", process.env.NODE_ENV);
  console.log("Debug: NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);

  if (!code) {
    console.log("Debug: No code found, redirecting to error page");
    return NextResponse.redirect("/auth/auth-code-error");
  }

  try {
    console.log("Debug: Attempting to exchange code for session");
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Debug: Error exchanging code for session", error);
      return NextResponse.redirect("/auth/auth-code-error");
    }

    console.log("Debug: Successfully exchanged code for session");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!siteUrl) {
      console.error("Debug: NEXT_PUBLIC_SITE_URL is not set");
      return NextResponse.redirect("/auth/auth-code-error");
    }

    const redirectUrl = `https://${siteUrl}${next}`;
    console.log("Debug: Final redirectUrl", redirectUrl);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Debug: Unexpected error", error);
    return NextResponse.redirect("/auth/auth-code-error");
  }
}