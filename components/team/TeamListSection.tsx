"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Team } from "@/types/friend";

interface TeamListSectionProps {
  teams: Team[];
  user_id: string;
}

const TeamListSection: React.FC<TeamListSectionProps> = ({ teams, user_id }) => {
  const router = useRouter();

  const handleViewTeamCalendar = (teamId: string) => {
    router.push(`/team-calendar?team=${teamId}`);
  };

  const handleViewMemberCalendar = (memberId: string) => {
    router.push(`/friend-calendar?friend=${memberId}`);
  };

  return (
    <div>
      {teams.map((team) => (
        <div key={team.id} className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => handleViewTeamCalendar(team.id)}
            className="w-full text-left mb-2 font-semibold text-gray-800 dark:text-gray-200"
          >
            {team.name}
          </button>
          <div className="flex flex-wrap gap-2">
            {team.members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleViewMemberCalendar(member.user_id)}
                className="flex items-center bg-white dark:bg-gray-600 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                <img
                  src={member.avatar_url || "/default-avatar.png"}
                  alt={`${member.username}のアバター`}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {member.username}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamListSection;
