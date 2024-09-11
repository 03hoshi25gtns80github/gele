import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Siwake from "./Siwake";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";


export default async function SiwakePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto py-8">
          <Suspense fallback={<div className="text-center">読み込み中...</div>}>
            <Siwake user={user as User} />
          </Suspense>
        </main>
      </div>
    </>
  );
}
