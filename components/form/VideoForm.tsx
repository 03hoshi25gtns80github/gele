import React, { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDropzone } from "react-dropzone";
import Spinner from "@/components/form/Spinner";

interface VideoFormProps {
  uid: string;
  onUpload: (url: string) => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ uid, onUpload }) => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (fileExt === "mts" || fileExt === "mp4" || fileExt === "mov") {
        setVideoFile(file);
        await handleUpload(file);
      } else {
        setError(
          "サポートされていないファイル形式です。MP4, MOV, MTS形式のファイルをアップロードしてください。"
        );
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/mts": [".mts"],
      "video/quicktime": [".mov"],
    },
    multiple: false,
  });

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

  const handleReset = () => {
    setVideoFile(null);
    setError(null);
  };

  return (
    <div className="mb-4">
      {!videoFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            ドラッグ＆ドロップまたはクリックして動画をアップロード
          </p>
          <p className="mt-1 text-xs text-gray-500">MP4, MOV, MTS (最大 1GB)</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center">
          <p className="text-2xl p-2 bg-gray-100 text-gray-500 rounded-lg">{videoFile.name}</p>
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="ml-2 px-3 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-100 transition duration-300"
            >
              削除して再選択
            </button>
          </div>
        </div>
      )}
      {uploading && (
        <div className="flex items-center mt-2">
          <Spinner className="mr-2" />
          <p className="text-sm text-blue-500">アップロード中...</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default VideoForm;