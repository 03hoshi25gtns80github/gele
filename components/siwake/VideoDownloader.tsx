"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { saveAs } from "file-saver";
import VideoSelectionDownloader from "./VideoSelectionDownloader";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  targets: string[];
  created_at: string;
  teams: {
    name: string;
  };
}

interface VideoDownloaderProps {
  user_id: string;
}

const VideoDownloader: React.FC<VideoDownloaderProps> = ({ user_id }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [downloadingJobs, setDownloadingJobs] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user_id) return;

      // team_idを取得
      const { data: teamData, error: teamError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user_id)
        .eq("status", "accepted");

      if (teamError) {
        console.error("Error fetching team IDs:", teamError);
        return;
      }

      const teamIds = teamData.map((team) => team.team_id);

      // video_jobsを取得
      const { data: jobsData, error: jobsError } = await supabase
        .from("video_jobs")
        .select("id, targets, created_at, teams(name)")
        .in("team_id", teamIds)
        .gte(
          "created_at",
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
      }

      // チーム名が存在しない場合の処理を追加
      const jobsWithTeamName = jobsData.map((job) => ({
        ...job,
        teams: job.teams ? job.teams : { name: "チーム設定無し" },
      }));

      setJobs(jobsWithTeamName as unknown as Job[]);
    };

    fetchJobs();
  }, [supabase, user_id]);

  const downloadVideo = async (jobId: string) => {
    if (downloadingJobs.has(jobId)) return; // 既にダウンロード中なら処理しない
    
    try {
      setDownloadingJobs(prev => new Set(prev).add(jobId));
      
      // 既存のダウンロード処理
      const { data: videoFiles, error } = await supabase
        .from("video_files")
        .select("original_path, processed_name")
        .eq("job_id", jobId);

      if (error) throw error;

      await Promise.all(videoFiles.map(async (file) => {
        const { data, error } = await supabase.storage
          .from("siwake_storage")
          .download(file.original_path);

        if (error) throw error;

        const extension = file.original_path.split('.').pop();
        const fileNameWithExtension = `${file.processed_name}.${extension}`;
        saveAs(data, fileNameWithExtension);
      }));

      toast.success('ダウンロードが完了しました');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('ダウンロード中にエラーが発生しました');
    } finally {
      setDownloadingJobs(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  // jobsステートから現在のジョブを見つける
  const currentJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        仕分けが完了した動画をダウンロード
      </h2>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-col p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {new Date(job.created_at).toLocaleDateString('ja-JP')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium whitespace-nowrap">
                  {job.teams.name}
                </span>
                <span className="text-gray-800 dark:text-gray-200 break-all">
                  {job.targets && job.targets.length > 0 
                    ? job.targets.join(", ")  // targetsが存在する場合のみjoinを実行
                    : "ターゲットなし"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => downloadVideo(job.id)}
                disabled={downloadingJobs.has(job.id)}
                className="flex items-center justify-center px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {downloadingJobs.has(job.id) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ダウンロード中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    一括ダウンロード
                  </>
                )}
              </button>
              <button
                className="flex items-center justify-center px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-150 ease-in-out"
                onClick={() => setSelectedJobId(job.id)}
              >
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="whitespace-nowrap">選択してダウンロード</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <VideoSelectionDownloader
        jobId={selectedJobId || ''}
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
        targets={jobs.find(j => j.id === selectedJobId)?.targets || []}
        isDownloading={downloadingJobs.has(selectedJobId || '')}
      />
    </div>
  );
};

export default VideoDownloader;
