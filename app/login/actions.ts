"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/my-calendar");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/signup-confirm");
}

export async function googleLogin() {
  const supabase = createClient();

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.NEXT_PUBLIC_SITE_URL || "gele-plus.vercel.app";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${protocol}://${host}/auth/callback`,
    },
  });

  if (error) {
    console.error('Googleログインエラー:', error);
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url);
  }
}
