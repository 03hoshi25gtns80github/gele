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
  teams: Team[];
  user_id: string;
}

const TeamListSection: React.FC<TeamListSectionProps> = ({
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
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{team.name}</h4>
            <ul>
              {team.members
                .filter((member) => member.user_id !== user_id)
                .map((member) => (
                  <li
                    key={member.id}
                    className="mb-2"
                  >
                    <button
                      onClick={() => handleViewCalendar(member.user_id)}
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors duration-200"
                    >
                      <img
                        src={member.avatar_url || "/default-avatar.png"}
                        alt={`${member.username}のアバター`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-gray-800 dark:text-gray-200">{member.username}</span>
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
