"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const TeamCreate: React.FC<{ user: User | null }> = ({ user }) => {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const createTeam = async () => {
    if (teamName.trim() === "") {
      alert("チーム名を入力してください。");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("teams")
      .insert({ name: teamName })
      .select()
      .single();

    if (error) {
      console.error("チーム作成エラー:", error);
      alert("そのチームは既に存在しています。");
      setLoading(false);
      return;
    }

    const teamId = data.id;

    const { error: memberError } = await supabase.from("team_members").insert({
      user_id: user?.id,
      team_id: teamId,
      status: "accepted",
    });

    if (memberError) {
      console.error("チーム参加エラー:", memberError);
      alert("チームへの自動参加に失敗しました。");
    } else {
      alert("チームを作成し、参加しました。");
      setTeamName("");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mt-2 mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4">新しいチームを作成</h2>
      <div className="mb-4">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="チーム名を入力"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        onClick={createTeam}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={loading}
      >
        {loading ? "作成中..." : "チームを作成"}
      </button>
    </div>
  );
};

export default TeamCreate;
