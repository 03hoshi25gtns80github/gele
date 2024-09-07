"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Team {
  id: string;
  name: string;
}

const TeamSearch: React.FC<{ user: User | null }> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const supabase = createClient();

  const fetchUserTeams = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (error) {
      console.error("ユーザーチーム取得エラー:", error);
      return;
    }

    setUserTeams(data.map((item: any) => item.team_id));
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("リクエスト取得エラー:", error);
      return;
    }

    setPendingRequests(data.map((item: any) => item.team_id));
  };

  useEffect(() => {
    fetchUserTeams();
    fetchPendingRequests();
  }, [user]);

  const handleSearch = async (term: string) => {
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("teams")
      .select("id, name")
      .ilike("name", `%${term}%`)
      .limit(10);

    if (error) {
      console.error("検索エラー:", error);
      return;
    }

    setSearchResults(data || []);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const requestToJoinTeam = async (teamId: string) => {
    if (!user) return;

    const { error } = await supabase.from("team_members").insert({
      user_id: user.id,
      team_id: teamId,
      status: "pending",
    });

    if (error) {
      console.error("参加リクエスト送信エラー:", error);
      alert("参加リクエストの送信に失敗しました。");
    } else {
      alert("参加リクエストを送信しました。");
      fetchPendingRequests(); // リクエスト送信後に再度取得
    }
  };

  return (
    <div className="mt-2">
      <div className="mb-2 shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 チーム検索、チーム名を入力"
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <ul>
        {searchResults.map((team) => (
          <li
            key={team.id}
            className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded"
          >
            <span>{team.name}</span>
            {userTeams.includes(team.id) ? (
              <span className="text-gray-500">参加済み</span>
            ) : pendingRequests.includes(team.id) ? (
              <span className="text-gray-500">リクエスト中</span>
            ) : (
              <button
                onClick={() => requestToJoinTeam(team.id)}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
              >
                参加リクエスト
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamSearch;
