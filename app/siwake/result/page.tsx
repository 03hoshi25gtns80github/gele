"use server";
import React from "react";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import VideoDownloader from "@/components/siwake/VideoDownloader";

const ResultPage = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <div className="flex w-3/5 p-10 items-center justify-center bg-white dark:bg-gray-800 mt-2 shadow-md rounded-lg overflow-hidden">
        <div className="text-center">
          <h1 className="text-3xl text-black dark:text-white font-bold mb-4">処理が完了しました！</h1>
          <p className="text-black dark:text-gray-200">結果を確認してください。</p>
        </div>
      </div>
      <div className="w-3/5 p-8 mx-auto bg-white dark:bg-gray-800 mt-2 mb-24 shadow-md rounded-lg overflow-hidden">
        <VideoDownloader user_id={user?.id || ""} />
      </div>
    </>
  );
};

export default ResultPage;
