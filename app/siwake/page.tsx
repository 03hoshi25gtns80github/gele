import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Siwake from "./Siwake";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import VideoDownloader from "@/components/siwake/VideoDownloader";


export default async function SiwakePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <div className="w-3/5 mx-auto bg-white mt-2 shadow-md rounded-lg overflow-hidden">
        <main className="container mx-auto py-8">
          <Suspense fallback={<div className="text-center">読み込み中...</div>}>
            <Siwake user={user as User} />
          </Suspense>
        </main>
      </div>
      <div className="w-3/5 p-8 mx-auto bg-white mt-2 mb-24 shadow-md rounded-lg overflow-hidden">
        <VideoDownloader user_id={user?.id || ""} />
      </div>
    </>
  );
}
