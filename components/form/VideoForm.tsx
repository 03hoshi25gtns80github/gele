"use client";
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
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", uid);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      let filePath = "";

      if (fileExt === "mts") {
        const response = await fetch("/api/convert-video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Video conversion failed");
        }

        const data = await response.json();
        filePath = data.filePath;
      } else {
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `${uid}-${randomString}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("videos")
          .upload(fileName, file, {
            contentType: `video/${fileExt}`,
          });

        if (error) {
          throw new Error("Upload failed");
        }

        filePath = data.path;
      }

      onUpload(filePath);
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(
        error instanceof Error
          ? error.message
          : "動画のアップロード中にエラーが発生しました。"
      );
    } finally {
      setUploading(false);
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
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ドラッグ＆ドロップまたはクリックして動画をアップロード
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">MP4, MOV, MTS (最大 1GB)</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center">
          <p className="text-sm md:text-2xl p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg">
            {videoFile.name}
          </p>
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="ml-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900 transition duration-300"
            >
              削除して再選択
            </button>
          </div>
        </div>
      )}
      {uploading && (
        <div className="flex items-center mt-2">
          <Spinner className="mr-2" />
          <p className="text-sm text-blue-500 dark:text-blue-400">アップロード中...</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default VideoForm;