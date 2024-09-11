"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { type User } from "@supabase/supabase-js";
import VideoFormMulti from "@/components/siwake/VideoFormMulti";
import TargetMember from "@/components/siwake/TargetMember";

interface SiwakeProps {
  user: User;
}

const Siwake: React.FC<SiwakeProps> = ({ user }) => {
  const [videoData, setVideoData] = useState<{ file: File; name: string }[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleVideoDataSelected = (videoData: { file: File; name: string }[]) => {
    setVideoData(videoData);
  };

  const handleUserInputChange = (inputs: string[]) => {
    setUserInputs(inputs);
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("video_jobs")
      .insert({ user_id: user.id, status: "pending" })
      .select()
      .single();

    if (error) {
      console.error(error);
      setIsLoading(false);
      setError("ジョブの作成に失敗しました。");
      return;
    }

    const jobId = data?.id;

    if (!jobId) {
      console.error("Job ID is undefined");
      setIsLoading(false);
      setError("ジョブの作成に失敗しました。");
      return;
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    for (const video of videoData) {
      if (video.file.size > MAX_FILE_SIZE) {
        console.error(`ファイルサイズが大きすぎます: ${video.name}`);
        setIsLoading(false);
        setError(`ファイルサイズが大きすぎます: ${video.name}`);
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from("siwake_storage")
        .upload(`${jobId}/${video.name}`, video.file);

      if (uploadError) {
        console.error(uploadError);
        setIsLoading(false);
        setError("ファイルのアップロードに失敗しました。");
        return;
      }

      // video_filesテーブルにデータを挿入
      const { error: insertError } = await supabase
        .from("video_files")
        .insert({ job_id: jobId, original_path: `${jobId}/${video.name}`, original_name: video.name });

      if (insertError) {
        console.error(insertError);
        setIsLoading(false);
        setError("ファイル情報の保存に失敗しました。");
        return;
      }
    }

    const response = await fetch("/api/siwake-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: jobId, // 明示的にjobIdを指定
        userInputs: userInputs.filter((input) => input.trim() !== ""), // 空の入力を除外
      }),
    });

    if (!response.ok) {
      console.error("Failed to start processing");
      setIsLoading(false);
      setError("処理の開始に失敗しました。");
      return;
    }

    router.push(`/siwake/processing/${jobId}`);
  };

  return (
    <>
      <div className="w-4/5 md:w-2/3 pb-20 bg-gradient-to-r from-blue-200 to-purple-300 min-h-screen flex flex-col items-center">
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-gray-800 mt-24 text-5xl md:text-6xl font-bold">
            動画処理システム
          </h1>
          <p className="text-gray-800 text-xl md:text-3xl mt-6">
            複数の動画ファイルをアップロードして処理します
          </p>
        </motion.div>
        <div className="flex flex-col items-center mt-10 space-y-6">
          <VideoFormMulti
            onVideoDataSelected={handleVideoDataSelected}
            uploading={isLoading}
            error={error}
          />
          <TargetMember onUserInputChange={handleUserInputChange} />
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="mt-4 bg-indigo-400 text-gray-800 text-xl font-bold py-3 px-6 rounded-full hover:bg-indigo-500 transition duration-300"
          >
            {isLoading ? "アップロード中..." : "アップロード"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Siwake;
