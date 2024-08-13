"use client";
import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Comment from "@/components/ui/Comment";

interface Videos {
  id: string;
  title: string;
  memo: string;
  video_url: string;
}

const VideoList = ({ videos }: { videos: Videos[] }) => {
  const supabase = createClient();
  const [videoUrls, setVideoUrls] = React.useState<string[]>([]);

  useEffect(() => {
    async function createVideoUrls(videos: Videos[]) {
      try {
        const urls: string[] = await Promise.all(
          videos.map(async (video) => {
            const { data } = await supabase.storage
              .from("videos")
              .getPublicUrl(video.video_url);
            if (!data || !data.publicUrl) {
              throw new Error("Error getting public URL");
            }
            return data.publicUrl;
          })
        );
        setVideoUrls(urls);
      } catch (error) {
        console.log("Error creating video URLs: ", error);
      }
    }

    if (videos.length > 0) createVideoUrls(videos);
  }, [videos, supabase]);

  return (
    <div>
      {videos.map((video, index) => (
        <div key={index}>
          <h2>{video.title}</h2>
          <p>{video.memo}</p>
          <video src={videoUrls[index]} controls />
          <Comment videoId={video.id} />
        </div>
      ))}
    </div>
  );
};

export default VideoList;