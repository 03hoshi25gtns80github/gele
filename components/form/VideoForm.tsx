"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface VideoFormProps {
  uid: string;
  onUpload: (url: string) => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ uid, onUpload }) => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVideoURL(URL.createObjectURL(file));
      await handleUpload(file); // ファイル選択時にアップロードを実行
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${uid}-${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    setUploading(false);

    if (error) {
      console.error("Error uploading video:", error.message);
    } else {
      onUpload(filePath);
      console.log("Video uploaded successfully:", data);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {videoURL && (
        <video width="320" height="240" controls>
          <source src={videoURL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default VideoForm;
