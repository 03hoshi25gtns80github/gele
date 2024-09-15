"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import TeamSearch from "./TeamSearch";

interface Team {
  id: string;
  name: string;
}

interface TeamRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: string;
  user: { username: string; avatar_url: string | null };
}

const TeamForm: React.FC<{ user: User | null }> = ({ user }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const supabase = createClient();

  const fetchTeams = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams(name)")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (error) {
      console.error("チーム取得エラー:", error);
      return;
    }

    setTeams(
      data.map((item: any) => ({ id: item.team_id, name: item.teams.name }))
    );
  };

  const fetchRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        id,
        user_id,
        team_id,
        status,
        profiles (
          username,
          avatar_url
        )
      `
      )
      .in(
        "team_id",
        teams.map((team) => team.id)
      )
      .eq("status", "pending");

    if (error) {
      console.error("リクエスト取得エラー:", error);
      return;
    }

    console.log("取得したリクエストデータ:", data); // デバッグ用

    const formattedData = await Promise.all(
      data.map(async (item: any) => {
        let avatar_url = "/default-avatar.png";
        if (item.profiles?.avatar_url) {
          try {
            const { data: downloadData, error: downloadError } =
              await supabase.storage
                .from("avatars")
                .download(item.profiles.avatar_url);

            if (downloadError) {
              throw downloadError;
            }

            avatar_url = URL.createObjectURL(downloadData);
          } catch (error) {
            console.error("アバター画像の取得エラー:", error);
          }
        }

        return {
          id: item.id,
          user_id: item.user_id,
          team_id: item.team_id,
          status: item.status,
          user: {
            username: item.profiles?.username || "Unknown",
            avatar_url,
          },
        };
      })
    );

    setRequests(formattedData);
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (teams.length > 0) {
      fetchRequests();
    }
  }, [teams]);

  const approveRequest = async (
    requestId: string,
    userId: string,
    teamId: string
  ) => {
    const { error } = await supabase
      .from("team_members")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      console.error("リクエスト承認エラー:", error);
      alert("リクエストの承認に失敗しました。");
      return;
    }

    alert("リクエストを承認しました。");
    fetchRequests();
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", requestId);

    if (error) {
      console.error("リクエスト拒否エラー:", error);
      alert("リクエストの拒否に失敗しました。");
      return;
    }

    alert("リクエストを拒否しました。");
    fetchRequests();
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("user_id", user.id)
      .eq("team_id", teamId);

    if (error) {
      console.error("チーム脱退エラー:", error);
      alert("チームからの脱退に失敗しました。");
    } else {
      alert("チームから脱退しました。");
      fetchTeams();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2">
      <div className="mb-2 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-2">所属チーム</h2>
        <ul className="mb-4">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex justify-between items-center mb-1 bg-blue-100 p-2 rounded"
            >
              <span>{team.name}</span>
              <button
                onClick={() => leaveTeam(team.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
              >
                脱退
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-2">チーム参加リクエスト</h2>
        {requests.length > 0 && (
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm mb-4"
          >
            {showRequests
              ? `リクエストを隠す`
              : `リクエスト表示（${requests.length}件）`}
          </button>
        )}
        {showRequests && (
          <ul className="mb-4">
            {requests.map((request) => {
              const teamName = teams.find((team) => team.id === request.team_id)?.name;
              return (
                <li
                  key={request.id}
                  className="mb-2 p-2 rounded"
                  style={{ border: "2px solid #ccc" }}
                >
                  <div className="bg-blue-100 p-2 rounded">
                    <strong>{teamName}への参加リクエスト</strong>
                  </div>
                  <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <div className="flex items-center">
                      <img
                        src={request.user.avatar_url || "/default-avatar.png"}
                        alt={`${request.user.username}のアバター`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{request.user.username}</span>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() =>
                          approveRequest(
                            request.id,
                            request.user_id,
                            request.team_id
                          )
                        }
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-2 hover:bg-green-700"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                      >
                        拒否
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <TeamSearch user={user} />
      </div>
    </div>
  );
};

export default TeamForm;
