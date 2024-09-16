"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { saveAs } from "file-saver";

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
    const { data: videoFiles, error } = await supabase
      .from("video_files")
      .select("original_path, processed_name")
      .eq("job_id", jobId);

    if (error) {
      console.error("Error fetching video files:", error);
      return;
    }

    videoFiles.forEach(async (file) => {
      const { data, error } = await supabase.storage
        .from("siwake_storage")
        .download(file.original_path);

      if (error) {
        console.error("Error downloading video:", error);
        return;
      }

      // original_pathから拡張子を取得
      const extension = file.original_path.split('.').pop();
      const fileNameWithExtension = `${file.processed_name}.${extension}`;

      saveAs(data, fileNameWithExtension);
    });
  };

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold mb-4">仕分けが完了した動画をダウンロード</h2>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex items-center justify-between p-4 bg-gray-100 rounded shadow"
          >
            <span className="font-mono">
              {job.teams.name} : {job.targets.join(", ")}
            </span>
            <button
              className="ml-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={() => downloadVideo(job.id)}
            >
              ダウンロード
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoDownloader;
