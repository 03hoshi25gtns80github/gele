"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface FriendData {
  id: string;
  username: string;
  status: "pending" | "accepted";
  type: "sent" | "received";
}

interface FriendListSectionProps {
  title: string;
  friends: FriendData[];
  showType?: boolean;
  onFriendAccepted?: (friendId: string) => void;
  user_id: string;
}

const FriendListSection: React.FC<FriendListSectionProps> = ({
  title,
  friends,
  showType = false,
  onFriendAccepted = () => {},
  user_id,
}) => {
  const supabase = createClient();
  const router = useRouter();

  const handleAccept = async (friendId: string) => {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", friendId);

    if (error) {
      console.error("友達承認エラー:", error);
    } else {
      onFriendAccepted(friendId);
    }
  };

  const handleViewCalendar = async (friendId: string) => {
    if (!user_id) return;

    const { data, error } = await supabase
      .from("friends")
      .select("requester_id, recipient_id")
      .eq("id", friendId)
      .single();

    if (error) {
      console.error("フレンド情報取得エラー:", error);
      return;
    }

    const friendUserId =
      data.requester_id === user_id ? data.recipient_id : data.requester_id;
    router.push(`/friend-calendar?friend=${friendUserId}`);
  };

  return (
    <>
      {title && <h3 className="font-semibold mt-4">{title}</h3>}
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} className="mb-2 flex items-center justify-between">
            <span>{friend.username}</span>
            {friend.status === "accepted" && (
              <button
                onClick={() => handleViewCalendar(friend.id)}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                カレンダー表示
              </button>
            )}
            {friend.type === "received" && friend.status === "pending" && (
              <button
                onClick={() => handleAccept(friend.id)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
              >
                承認
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default FriendListSection;