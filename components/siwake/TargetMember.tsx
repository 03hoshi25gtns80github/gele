"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface TargetMemberProps {
  onUserInputChange: (inputs: string[]) => void;
  userid: string;
  onTeamSelect: (teamId: string | null) => void;
}

const TargetMember: React.FC<TargetMemberProps> = ({
  onUserInputChange,
  userid,
  onTeamSelect,
}) => {
  const [userInputs, setUserInputs] = useState<string[]>([""]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", userid)
        .eq("status", "accepted");

      if (error) {
        console.error(error);
        return;
      }

      const teamIds = data.map((record: any) => record.team_id);

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name")
        .in("id", teamIds);

      if (teamsError) {
        console.error(teamsError);
        return;
      }

      setTeams(teamsData);
    };

    fetchTeams();
  }, [userid]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
    onUserInputChange(newInputs);
  };

  const addInputField = () => {
    setUserInputs([...userInputs, ""]);
  };

  const removeInputField = (index: number) => {
    const newInputs = userInputs.filter((_, i) => i !== index);
    setUserInputs(newInputs.length > 0 ? newInputs : [""]);
    onUserInputChange(newInputs);
  };

  const handleTeamClick = async (teamId: string) => {
    setSelectedTeam(teamId);
    onTeamSelect(teamId);

    const { data, error } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId)
      .eq("status", "accepted");

    if (error) {
      console.error(error);
      return;
    }

    const userIds = data.map((record: any) => record.user_id);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error(profilesError);
      return;
    }

    const userNames = profilesData.map((profile: any) => profile.full_name);
    setUserInputs(userNames.length > 0 ? userNames : [""]);
    onUserInputChange(userNames);
  };

  return (
    <div className="mb-4 p-4 border-2 border-indigo-500 dark:border-teal-400 rounded-md bg-white dark:bg-gray-800">
      <div className="mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">チームリスト</h2>
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamClick(team.id)}
            className={`block w-full text-left p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 ease-in-out ${
              selectedTeam === team.id ? "bg-blue-200 dark:bg-blue-700" : ""
            }`}
          >
            <span className="text-gray-800 dark:text-gray-200">{team.name}</span>
          </button>
        ))}
      </div>
      <div className="mb-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md">
        <div className="flex items-center py-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">メンバーリスト</h2>
          <button
            onClick={addInputField}
            className="ml-4 border-2 border-blue-500 dark:border-teal-400 text-xl text-blue-500 dark:text-teal-400 px-3 rounded-full hover:bg-blue-200 dark:hover:bg-teal-700 hover:text-white transition duration-150 ease-in-out"
          >
            +
          </button>
        </div>
        {userInputs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">仕分け対象の名前を入力してください</p>
        ) : (
          userInputs.map((input, index) => (
            <div key={index} className="flex items-center mb-2 pb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="仕分け対象の名前を入力してください"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={() => removeInputField(index)}
                className="ml-2 bg-red-500 text-4xl text-white px-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out"
              >
                -
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TargetMember;
