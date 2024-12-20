"use client";
import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import FriendListSection from "./FriendListSection";
import TeamListSection from "../team/TeamListSection";
import { useFriendsStore } from "@/store/friendsStore";
import { FriendData } from "@/types/friend";

const FriendsList = ({ user }: { user: User | null }) => {
  const { friends, teams, isLoading } = useFriendsStore();
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "teams">("friends");

  const filterFriendsByCategory = (
    status: "accepted" | "pending",
    type?: "sent" | "received"
  ) => {
    return friends.filter(
      (friend) =>
        friend.status === status && (type ? friend.type === type : true)
    );
  };

  if (!user) {
    return <div>ユーザーがログインしていません。</div>;
  }

  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
      <nav className="mb-4">
        <button
          className={`mr-4 pb-2 ${
            activeTab === "friends"
              ? "font-bold border-b-2 border-green-500 dark:border-green-400"
              : ""
          } text-gray-800 dark:text-gray-200`}
          onClick={() => setActiveTab("friends")}
        >
          フレンド
        </button>
        <button
          className={`mr-4 pb-2 ${
            activeTab === "requests"
              ? "font-bold border-b-2 border-green-500 dark:border-green-400"
              : ""
          } text-gray-800 dark:text-gray-200`}
          onClick={() => setActiveTab("requests")}
        >
          リクエスト
        </button>
        <button
          className={`pb-2 ${
            activeTab === "teams" ? "font-bold border-b-2 border-green-500 dark:border-green-400" : ""
          } text-gray-800 dark:text-gray-200`}
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
          teams={teams}
          user_id={user.id}
        />
      )}
    </div>
  );
};

export default FriendsList;
