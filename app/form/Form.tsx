"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MemoForm from "@/components/form/MemoForm";
import TitleForm from "@/components/form/TitleForm";
import VideoForm from "@/components/form/VideoForm";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

const Form = ({ user }: { user: User | null }) => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [memo, setMemo] = useState("");
  const [title, setTitle] = useState("");
  const [videoURL, setVideoURL] = useState("");

  const handleMemoChange = (newMemo: string) => setMemo(newMemo);
  const handleTitleChange = (newTitle: string) => setTitle(newTitle);
  const handleVideoUpload = (url: string) => setVideoURL(url);

  const handleSubmit = async () => {
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
  };

  return (
    <div>
      <TitleForm onTitleChange={handleTitleChange} />
      <MemoForm onMemoChange={handleMemoChange} />
      <VideoForm uid={user?.id || ""} onUpload={handleVideoUpload} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Form;
