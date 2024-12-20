"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import VideoFormMulti from "@/components/siwake/VideoFormMulti";
import TargetMember from "@/components/siwake/TargetMember";
import { toast } from "react-hot-toast";

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
    if (!selectedTeam) {
      toast.error('チームを選択してください');
      return;
    }

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

    // アップロード中のキャンセル状態チェック
    const checkCancellation = async () => {
      const { data } = await supabase
        .from('video_jobs')
        .select('status')
        .eq('id', jobId)
        .single();
      
      return data?.status === 'cancelled';
    };

    for (const video of videoData) {
      // 各ビデオ�����ップロード前にキャンセル状態をチェック
      if (await checkCancellation()) {
        setIsLoading(false);
        setError('処理がキャンセルされました');
        return;
      }

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
    if (!currentJobId) {
      toast.error('キャンセルするジョブが見つかりません');
      return;
    }

    try {
      setError(null);
      
      // キャンセル中の状態を表示
      toast.loading('処理をキャンセル中...', {
        duration: 3000,
      });

      const response = await fetch("/api/siwake-api", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentJobId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'キャンセル処理に失敗しました');
      }

      // キャンセル成功時の処理
      toast.success('処理をキャンセルしました');
      setIsLoading(false);
      setCurrentJobId(null);
      setVideoData([]);
      setError(null);

      // 一定時間後にリダイレクト
      setTimeout(() => {
        router.push('/siwake');
      }, 2000);

    } catch (error) {
      console.error("キャンセルエラー:", error);
      toast.error('キャンセルに失敗しました');
      setError((error as Error).message);
    }
  };

  const handleUploadClick = () => {
    if (!selectedTeam) {
      toast.error('チームを選択してください');
      return;
    }
    if (videoData.length === 0) {
      toast.error('動画を選択してください');
      return;
    }
    handleUpload();
  };

  const isButtonDisabled = () => {
    return isLoading;  // ローディング中のみボタンを無効化
  };

  // コンポーネントのクリーンアップ処理を改善
  useEffect(() => {
    return () => {
      if (isLoading && currentJobId) {
        // アンマウント時のキャンセル処理
        handleCancel().catch(error => {
          console.error("クリーンアップ中のエラー:", error);
        });
      }
    };
  }, [isLoading, currentJobId]);

  // ブラウザの更新/閉じる時の警告を改善
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        const message = '処理を中断してもよろしいですか？\n進行中の処理は失われます。';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-lg overflow-hidden relative shadow-lg">
      {isLoading && (
        <div className="fixed w-full min-h-screen inset-0 bg-black bg-opacity-80 z-50">
          {/* 処理中メッセージとキャンセルボタンを含むコンテナ */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white dark:bg-gray-700 bg-opacity-90 p-8 rounded-lg shadow-lg relative">
              {/* メッセージ部分 */}
              <div className="flex flex-col items-center space-y-4 mb-12"> {/* mb-12 を追加してボタンのスペースを確保 */}
                <div className="text-black dark:text-white text-2xl font-bold text-center">
                  {error ? (
                    '処理中にエラーが発生しました'
                  ) : (
                    '仕分け中です、このままお待ちください...'
                  )}
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">
                    {error}
                  </p>
                )}
              </div>
              
              {/* キャンセルボタン - グレーの枠内右下に配置 */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 
                           text-white font-bold py-2 px-4 rounded 
                           transition duration-150 ease-in-out"
                >
                  <span>キャンセル</span>
                </button>
              </div>
            </div>
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
        <div className="relative">
          <button
            onClick={handleUploadClick}
            className={`w-full text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out ${
              isLoading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "仕分け中..." : "仕分け開始"}
          </button>
          {!selectedTeam && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">
              チームを選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Siwake;
