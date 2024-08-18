"use client";

import React, { useEffect, useState } from "react";
import Calendar from "@/components/ui/Calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const FriendCalendar: React.FC = () => {
  const [dates, setDates] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendId = searchParams.get('friend');

  useEffect(() => {
    const fetchDates = async () => {
      if (!friendId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("video_dates")
        .select("date")
        .eq("user_id", friendId);

      if (error) {
        console.error("Error fetching dates:", error);
      } else {
        setDates(data.map((item: { date: string }) => item.date));
      }
    };

    fetchDates();
  }, [friendId]);

  const handleDateSelect = (date: string) => {
    if (dates.includes(date)) {
      router.push(`/friend-video?friend=${friendId}&date=${date}`);
    } else {
      router.push(`/login`);
    }
  };

  return <Calendar dates={dates} onDateSelect={handleDateSelect} />;
};

export default FriendCalendar;