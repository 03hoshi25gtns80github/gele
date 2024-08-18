"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MemoForm from "@/components/form/MemoForm";
import TitleForm from "@/components/form/TitleForm";
import VideoForm from "@/components/form/VideoForm";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Spinner from "@/components/form/Spinner";

const Form = ({ user }: { user: User | null }) => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [memo, setMemo] = useState("");
  const [title, setTitle] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemoChange = (newMemo: string) => setMemo(newMemo);
  const handleTitleChange = (newTitle: string) => setTitle(newTitle);
  const handleVideoUpload = (url: string) => setVideoURL(url);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data, error } = await supabase.from("videos").insert([
      {
        video_url: videoURL,
        memo,
        title,
        date,
        user_id: user?.id,
      },
    ]);

    if (error) {
      console.error("Error inserting data:", error.message);
    } else {
      console.log("Data inserted successfully:", data);
    }
    setIsSubmitting(false);
    alert("登録完了！");
  };

  return (
    <div className="w-2/3 mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          コンテンツアップロード
        </h2>
        <div className="space-y-4">
          <TitleForm onTitleChange={handleTitleChange} />
          <MemoForm onMemoChange={handleMemoChange} />
          <VideoForm uid={user?.id || ""} onUpload={handleVideoUpload} />
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <button
          onClick={handleSubmit}
          className={`w-full text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out ${
            isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner className="mx-auto" />
          ) : (
            "登録"
          )}
        </button>
      </div>
    </div>
  );
};

export default Form;