"use client";
import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Comment from "@/components/ui/Comment";
import { FaStickyNote } from "react-icons/fa";
import DeleteVideoButton from "@/components/ui/DeleteVideoButton";

interface Videos {
  id: string;
  title: string;
  memo: string;
  video_url: string;
}

interface VideoListProps {
  videos: Videos[];
  user_id?: string;
}

const VideoList = ({ videos, user_id }: VideoListProps) => {
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
    <div className="w-2/3">
      {videos.map((video, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-blue-200 to-blue-100 p-4 mt-4 mb-4 rounded flex shadow-lg relative"
        >
          <div className="flex-1 w-2/3">
            <h2 className="text-2xl font-bold mb-2 ml-4">{video.title}</h2>
            <video src={videoUrls[index]} controls className="w-full mb-2" />
          </div>
          <div className="mt-10 ml-4 w-1/3">
            <div className="mb-4 bg-white p-2 rounded">
              <div className="flex items-center border-b-2 border-gray-400">
                <FaStickyNote className="ml-2 mb-2 text-gray-400 text-3xl" />
                <div className="text-xl font-bold ml-2">メモ</div>
              </div>
              <p className="mt-2">{video.memo}</p>
            </div>
            <Comment videoId={video.id} />
          </div>
          {user_id && (
            <div className="absolute top-4 right-6">
              <DeleteVideoButton videoId={video.id} userId={user_id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoList;