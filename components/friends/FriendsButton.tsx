"use client";

import React, { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import FriendsList from "./FriendsList";
import { FaUserFriends } from "react-icons/fa"; // アイコンをインポート

interface FriendsButtonProps {
  user: User | null;
}

const FriendsButton: React.FC<FriendsButtonProps> = ({ user }) => {
  const [showFriendsList, setShowFriendsList] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleFriendsList = () => {
    setShowFriendsList(!showFriendsList);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (listRef.current && !listRef.current.contains(event.target as Node)) {
      setShowFriendsList(false);
    }
  };

  useEffect(() => {
    if (showFriendsList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFriendsList]);

  return (
    <div className="fixed bottom-12 right-12">
      <button
        onClick={toggleFriendsList}
        className="bg-green-500 hover:bg-green-700 text-white font-bold p-6 rounded-full shadow-lg"
      >
        <FaUserFriends size={32} />
      </button>
      {showFriendsList && (
        <div
          ref={listRef}
          className="absolute bottom-12 right-0 w-64 bg-white p-4 rounded shadow-lg"
        >
          <FriendsList user={user} />
        </div>
      )}
    </div>
  );
};

export default FriendsButton;
