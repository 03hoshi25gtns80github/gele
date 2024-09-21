"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null); // 追加
  const [currentJobId, setCurrentJobId] = useState<string | null>(null); // 追加
  const supabase = createClient();
  const router = useRouter();

  const handleVideoDataSelected = (videoData: { file: File; name: string }[]) => {
    setVideoData(videoData);
  };

  const handleUserInputChange = (inputs: string[]) => {
    setUserInputs(inputs);
  };

  const handleTeamSelect = (teamId: string | null) => {
    setSelectedTeam(teamId); // 追加
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("video_jobs")
      .insert({ user_id: user.id, status: "pending", team_id: selectedTeam })
      .select()
      .single();

    if (error) {
      console.error(error);
      setIsLoading(false);
      setError("ジョブの作成に失敗しました。");
      return;
    }

    const jobId = data?.id;
    setCurrentJobId(jobId); // 追加

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

  const handleCancel = async () => {
    setIsLoading(false);
    setError(null);

    const response = await fetch("/api/siwake-api/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: currentJobId }), // currentJobIdは現在のジョブID
    });

    if (!response.ok) {
      console.error("キャンセルに失敗しました");
      setError("キャンセルに失敗しました");
    } else {
      console.log("キャンセルが成功しました");
    }
  };

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-lg overflow-hidden relative shadow-lg">
      {isLoading && (
        <div className="fixed w-full min-h-screen inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 bg-opacity-90 p-8 rounded-lg shadow-lg">
            <div className="text-black dark:text-white text-2xl font-bold">
              仕分け中です、このままお待ちください...
            </div>
            <button
              onClick={handleCancel}
              className="mt-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      <div className="px-6 py-4">
        <h2 className="text-4xl font-bold text-center mb-6 animate-fade-in text-gray-700 dark:text-gray-200 text-shadow-md">
          映像仕分けAI
        </h2>
        <div className="space-y-4">
          <TargetMember
            userid={user.id}
            onUserInputChange={handleUserInputChange}
            onTeamSelect={handleTeamSelect}
          />
          <VideoFormMulti
            onVideoDataSelected={handleVideoDataSelected}
            uploading={isLoading}
            error={error}
          />
        </div>
      </div>
      <div className="px-6 py-4">
        <button
          onClick={handleUpload}
          className={`w-full text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out ${
            isLoading
              ? "bg-gray-400 dark:bg-gray-600"
              : "bg-blue-500 hover:bg-blue-600 dark:bg-teal-600 dark:hover:bg-teal-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "仕分け中..." : "仕分け開始"}
        </button>
      </div>
    </div>
  );
};

export default Siwake;
