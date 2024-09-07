"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface TeamMember {
  id: string;
  username: string;
  avatar_url: string | null;
  user_id: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamListSectionProps {
  title: string;
  teams: Team[];
  user_id: string;
}

const TeamListSection: React.FC<TeamListSectionProps> = ({
  title,
  teams,
  user_id,
}) => {
  const supabase = createClient();
  const router = useRouter();

  const handleViewCalendar = async (teamMemberUserId: string) => {
    router.push(`/friend-calendar?friend=${teamMemberUserId}`);
  };

  console.log("表示するチームデータ:", teams); // デバッグ用

  return (
    <>
      {title && <h3 className="font-semibold mt-4">{title}</h3>}
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="mb-4">
            <h4 className="font-semibold">{team.name}</h4>
            <ul>
              {team.members
                .filter((member) => member.user_id !== user_id) // 自分以外のメンバーをフィルタリング
                .map((member) => (
                  <li
                    key={member.id}
                    className="mb-2 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={member.avatar_url || "/default-avatar.png"}
                        alt={`${member.username}のアバター`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{member.username}</span>
                    </div>
                    <button
                      onClick={() => handleViewCalendar(member.user_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      カレンダー表示
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TeamListSection;
