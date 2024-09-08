"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface FriendData {
  id: string;
  username: string;
  avatar_url: string | null; // 変更
  status: "pending" | "accepted";
  type: "sent" | "received";
  user_id: string;
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

  const handleViewCalendar = async (friendUserId: string) => {
    router.push(`/friend-calendar?friend=${friendUserId}`);
  };

  return (
    <>
      {title && <h3 className="font-semibold mt-4">{title}</h3>}
      <ul>
        {friends.map((friend) => (
          <li
            key={friend.id}
            className="mb-2 flex items-center justify-between"
          >
            {friend.status === "accepted" ? (
              <button
                onClick={() => handleViewCalendar(friend.user_id)}
                className="flex items-center w-full p-2 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
              >
                <img
                  src={friend.avatar_url || "/default-avatar.png"}
                  alt={`${friend.username}のアバター`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{friend.username}</span>
              </button>
            ) : (
              <div className="flex items-center">
                <img
                  src={friend.avatar_url || "/default-avatar.png"}
                  alt={`${friend.username}のアバター`}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{friend.username}</span>
              </div>
            )}
            {friend.type === "received" && friend.status === "pending" && (
              <button
                onClick={() => handleAccept(friend.id)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
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
