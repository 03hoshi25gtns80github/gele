"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import VideoList from "@/components/ui/VideoList";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";

interface Videos {
  id: string;
  title: string;
  memo: string;
  video_url: string;
}

const FriendVideo = () => {
  const [videos, setVideos] = useState<Videos[]>([]);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const friendId = searchParams.get("friend");

  useEffect(() => {
    const fetchVideos = async () => {
      if (friendId) {
        const { data, error } = await supabase
          .from("videos")
          .select("id, title, memo, video_url")
          .eq("user_id", friendId)
          .eq("date", date);

        if (!error) {
          setVideos(data as Videos[]);
        }
      }
    };

    fetchVideos();
  }, [date, friendId]);

  return (
    <>
      <Header id={friendId} />
      <VideoList videos={videos} />
    </>
  );
};

export default FriendVideo;
