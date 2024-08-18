"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface HeaderProps {
  id: string | null;
}

const WELCOME_MESSAGE = "ようこそ！ gle-chへ！";

const Header: React.FC<HeaderProps> = ({ id }) => {
  const supabase = createClient();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching username:", error);
        } else {
          setUsername(data?.username);
        }
      } else {
        setUsername(null);
      }
    };

    fetchUsername();
  }, [id]);

  return (
    <header className="bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400 p-7 shadow-lg w-full z-30">
      <div className="flex justify-center">
        <h1 className="text-white text-3xl font-bold">
          {username ? `${username} のカレンダー` : WELCOME_MESSAGE}
        </h1>
      </div>
    </header>
  );
};

export default Header;