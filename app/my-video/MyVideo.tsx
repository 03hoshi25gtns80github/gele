"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import VideoList from "@/components/ui/VideoList";
import { useSearchParams } from "next/navigation";

interface Videos {
  id: string;
  title: string;
  memo: string;
  video_url: string;
}

const MyVideo = ({ user }: { user: User | null }) => {
  const [videos, setVideos] = useState<Videos[]>([]);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  useEffect(() => {
    const fetchVideos = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("videos")
          .select("id, title, memo, video_url")
          .eq("user_id", user.id)
          .eq("date", date);

        if (!error) {
          setVideos(data as Videos[]);
        }
      }
    };

    fetchVideos();
  }, [date, user]);

  return <VideoList videos={videos} user_id={user?.id} />;
};

export default MyVideo;
