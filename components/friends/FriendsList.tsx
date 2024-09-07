"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import FriendListSection from "./FriendListSection";
import TeamListSection from "../team/TeamListSection";

interface FriendData {
  id: string;
  username: string;
  avatar_url: string | null;
  status: "pending" | "accepted";
  type: "sent" | "received";
  user_id: string;
}

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

const FriendsList = ({ user }: { user: User | null }) => {
  const [friendsList, setFriendsList] = useState<FriendData[]>([]);
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "teams">(
    "friends"
  );
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchAndSetFriends(user.id);
      fetchAndSetTeams(user.id);
    }
  }, [user]);

  const fetchAndSetFriends = async (userId: string) => {
    const friendsData = await getFriendsData(userId);
    if (!friendsData) return;

    const formattedFriends = await formatFriendsData(friendsData, userId);
    setFriendsList(formattedFriends);
  };

  const getFriendsData = async (userId: string) => {
    const { data, error } = await supabase
      .from("friends")
      .select(
        `
        id,
        status,
        requester_id,
        recipient_id,
        requester:profiles!requester_id(username, avatar_url),
        recipient:profiles!recipient_id(username, avatar_url)
      `
      )
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (error) {
      console.error("フレンドリストの取得エラー:", error);
      return null;
    }

    return data;
  };

  const formatFriendsData = async (
    data: any[],
    userId: string
  ): Promise<FriendData[]> => {
    const formattedData = await Promise.all(
      data.map(async (friend) => {
        const avatarPath =
          friend.requester_id === userId
            ? friend.recipient.avatar_url
            : friend.requester.avatar_url;

        let avatar_url = null;
        if (avatarPath) {
          try {
            const { data: downloadData, error: downloadError } =
              await supabase.storage.from("avatars").download(avatarPath);

            if (downloadError) {
              throw downloadError;
            }

            avatar_url = URL.createObjectURL(downloadData);
          } catch (error) {
            console.error("Error downloading image: ", error);
          }
        }

        return {
          id: friend.id,
          username:
            friend.requester_id === userId
              ? friend.recipient.username
              : friend.requester.username,
          avatar_url,
          status: friend.status,
          type:
            friend.requester_id === userId
              ? ("sent" as "sent")
              : ("received" as "received"), // 型を明示的に指定
          user_id:
            friend.requester_id === userId
              ? friend.recipient_id
              : friend.requester_id,
        };
      })
    );

    return formattedData;
  };

  const fetchAndSetTeams = async (userId: string) => {
    const teamsData = await getTeamsData(userId);
    if (!teamsData) return;

    const formattedTeams = await formatTeamsData(teamsData);
    setTeamsList(formattedTeams);
  };

  const getTeamsData = async (userId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        team_id,
        teams(name)
      `
      )
      .eq("user_id", userId)
      .eq("status", "accepted");

    if (error) {
      console.error("チームデータの取得エラー:", error);
      return null;
    }

    console.log("取得したチームデータ:", data); // デバッグ用

    return data;
  };

  const formatTeamsData = async (data: any[]): Promise<Team[]> => {
    const teamsMap: { [key: string]: Team } = {};

    for (const item of data) {
      const teamId = item.team_id;
      const teamName = item.teams.name;

      if (!teamsMap[teamId]) {
        teamsMap[teamId] = {
          id: teamId,
          name: teamName,
          members: [],
        };
      }

      // チームメンバーを取得
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select(
          `
          user_id,
          profiles(username, avatar_url)
        `
        )
        .eq("team_id", teamId)
        .eq("status", "accepted");

      if (membersError) {
        console.error("チームメンバーの取得エラー:", membersError);
        continue;
      }

      console.log(`取得したチームメンバー (${teamName}):`, membersData); // デバッグ用

      for (const memberItem of membersData) {
        const profiles = Array.isArray(memberItem.profiles) ? memberItem.profiles : [memberItem.profiles];

        for (const profile of profiles) {
          const member: TeamMember = {
            id: memberItem.user_id,
            username: profile.username,
            avatar_url: profile.avatar_url,
            user_id: memberItem.user_id,
          };

          if (profile.avatar_url) {
            try {
              const { data: downloadData, error: downloadError } =
                await supabase.storage
                  .from("avatars")
                  .download(profile.avatar_url);

              if (downloadError) {
                throw downloadError;
              }

              member.avatar_url = URL.createObjectURL(downloadData);
            } catch (error) {
              console.error("Error downloading image: ", error);
            }
          }

          teamsMap[teamId].members.push(member);
        }
      }
    }

    console.log("フォーマットされたチームデータ:", teamsMap); // デバッグ用

    return Object.values(teamsMap);
  };

  const filterFriendsByCategory = (
    status: "accepted" | "pending",
    type?: "sent" | "received"
  ) => {
    return friendsList.filter(
      (friend) =>
        friend.status === status && (type ? friend.type === type : true)
    );
  };

  const handleFriendAccepted = (friendId: string) => {
    setFriendsList((prevFriends) =>
      prevFriends.map((friend) =>
        friend.id === friendId ? { ...friend, status: "accepted" } : friend
      )
    );
  };

  if (!user) {
    return <div>ユーザーがログインしていません。</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow-lg">
      <nav className="mb-4">
        <button
          className={`mr-4 pb-2 ${
            activeTab === "friends"
              ? "font-bold border-b-2 border-green-500"
              : ""
          }`}
          onClick={() => setActiveTab("friends")}
        >
          フレンド
        </button>
        <button
          className={`mr-4 pb-2 ${
            activeTab === "requests"
              ? "font-bold border-b-2 border-green-500"
              : ""
          }`}
          onClick={() => setActiveTab("requests")}
        >
          リクエスト
        </button>
        <button
          className={`pb-2 ${
            activeTab === "teams" ? "font-bold border-b-2 border-green-500" : ""
          }`}
          onClick={() => setActiveTab("teams")}
        >
          チーム
        </button>
      </nav>
      {activeTab === "friends" && (
        <FriendListSection
          title=""
          friends={filterFriendsByCategory("accepted")}
          user_id={user.id}
        />
      )}
      {activeTab === "requests" && (
        <>
          <FriendListSection
            title="届いたリクエスト"
            friends={filterFriendsByCategory("pending", "received")}
            showType={true}
            onFriendAccepted={handleFriendAccepted}
            user_id={user.id}
          />
          <FriendListSection
            title="承認待ち"
            friends={filterFriendsByCategory("pending", "sent")}
            showType={true}
            user_id={user.id}
          />
        </>
      )}
      {activeTab === "teams" && (
        <TeamListSection
          title="所属チーム"
          teams={teamsList}
          user_id={user.id}
        />
      )}
    </div>
  );
};

export default FriendsList;
