"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MemoForm from "@/components/form/MemoForm";
import TitleForm from "@/components/form/TitleForm";
import VideoForm from "@/components/form/VideoForm";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Spinner from "@/components/form/Spinner";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Form = ({ user }: { user: User | null }) => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get("date");

  const [memo, setMemo] = useState("");
  const [title, setTitle] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMemoChange = (newMemo: string) => setMemo(newMemo);
  const handleTitleChange = (newTitle: string) => setTitle(newTitle);
  const handleVideoUpload = (url: string) => setVideoURL(url);

  const validateInputs = () => {
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return false;
    }
    if (!memo.trim()) {
      toast.error('メモを入力してください');
      return false;
    }
    if (!videoURL) {
      toast.error('動画をアップロードしてください');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
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
        throw error;
      }

      toast.success('登録が完了しました');
      router.push(`/my-video?date=${date}`);
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-4/5 md:w-3/5 mx-auto mt-2 mb-24 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden md:mt-6">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          動画を登録
        </h2>
        <div className="space-y-4">
          <TitleForm onTitleChange={handleTitleChange} />
          <MemoForm onMemoChange={handleMemoChange} />
          <VideoForm uid={user?.id || ""} onUpload={handleVideoUpload} />
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={handleSubmit}
          className={`w-full text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out ${
            isSubmitting
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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