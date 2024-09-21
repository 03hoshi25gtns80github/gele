"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Spinner from "@/components/form/Spinner";

interface VideoFormMultiProps {
  onVideoDataSelected: (videoData: { file: File; name: string }[]) => void;
  uploading: boolean;
  error: string | null;
}

const VideoFormMulti: React.FC<VideoFormMultiProps> = ({
  onVideoDataSelected,
  uploading,
  error,
}) => {
  const [selectedVideos, setSelectedVideos] = useState<{ file: File; name: string }[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newVideos = acceptedFiles.map(file => ({
        file,
        name: file.name
      }));
      setSelectedVideos(newVideos);
      onVideoDataSelected(newVideos);
    },
    [onVideoDataSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/mts": [".mts"],
      "video/quicktime": [".mov"],
    },
    multiple: true,
  });

  const handleReset = () => {
    setSelectedVideos([]);
  };

  return (
    <div className="mb-4 p-4 border-2 border-indigo-500 dark:border-teal-500 rounded-md bg-white dark:bg-gray-800">
      <label
        htmlFor="videoUpload"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        仕分けする動画をアップロード
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition duration-150 ease-in-out ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:border-teal-400 dark:bg-teal-900"
            : "border-gray-300 dark:border-gray-600 hover:border-teal-500 dark:hover:border-teal-400"
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
      {selectedVideos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">選択されたファイル:</p>
          <ul className="list-disc list-inside">
            {selectedVideos.map((video, index) => (
              <li key={index} className="text-sm text-gray-500 dark:text-gray-400">
                {video.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleReset}
            className="mt-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900 transition duration-300"
          >
            削除して再選択
          </button>
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

export default VideoFormMulti;
