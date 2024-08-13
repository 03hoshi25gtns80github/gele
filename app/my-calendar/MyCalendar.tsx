"use client";

import React, { useEffect, useState } from "react";
import Calendar from "@/components/ui/Calendar";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

interface MyCalendarProps {
  initialUser: User;
}

const MyCalendar: React.FC<MyCalendarProps> = ({ initialUser }) => {
  const [dates, setDates] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDates = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("video_dates")
        .select("date")
        .eq("user_id", initialUser.id);

      if (error) {
        console.error("Error fetching dates:", error);
      } else {
        setDates(data.map((item: { date: string }) => item.date));
      }
    };

    fetchDates();
  }, [initialUser]);

  const handleDateSelect = (date: string) => {
    if (dates.includes(date)) {
      router.push(`/my-video?date=${date}`);
    } else {
      router.push(`/form?date=${date}`);
    }
  };

  return <Calendar dates={dates} onDateSelect={handleDateSelect} />;
};

export default MyCalendar;