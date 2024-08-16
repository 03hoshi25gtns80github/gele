"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface FriendData {
  id: string;
  username: string;
  status: "pending" | "accepted";
  type: "sent" | "received";
}

const FriendsList = ({ user }: { user: User | null }) => {
  const [friendsList, setFriendsList] = useState<FriendData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchAndSetFriends(user.id);
    }
  }, [user]);

  const fetchAndSetFriends = async (userId: string) => {
    const friendsData = await getFriendsData(userId);
    if (!friendsData) return;

    const formattedFriends = formatFriendsData(friendsData, userId);
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
        requester:profiles!requester_id(username),
        recipient:profiles!recipient_id(username)
      `
      )
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (error) {
      console.error("フレンドリストの取得エラー:", error);
      return null;
    }

    return data;
  };

  const formatFriendsData = (data: any[], userId: string): FriendData[] => {
    return data.map((friend) => ({
      id: friend.id,
      username:
        friend.requester_id === userId
          ? friend.recipient.username
          : friend.requester.username,
      status: friend.status,
      type: friend.requester_id === userId ? "sent" : "received",
    }));
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

  const renderFriendList = (
    title: string,
    friends: FriendData[],
    showType: boolean = false
  ) => (
    <>
      <h3 className="font-semibold mt-4">{title}</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} className="mb-2">
            {friend.username}
            {showType && ` (${friend.type === "sent" ? "送信済み" : "受信中"})`}
          </li>
        ))}
      </ul>
    </>
  );

  if (!user) {
    return <div>ユーザーがログインしていません。</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow-lg">
      <h2 className="text-lg font-bold mb-4">フレンドリスト</h2>
      {renderFriendList(
        "承認済みフレンド",
        filterFriendsByCategory("accepted")
      )}
      {renderFriendList(
        "承認待ち",
        filterFriendsByCategory("pending", "sent"),
        true
      )}
      {renderFriendList(
        "フレンドリクエスト",
        filterFriendsByCategory("pending", "received"),
        true
      )}
    </div>
  );
};

export default FriendsList;
