"use client";
import React, { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import FriendsList from "./FriendsList";
import FriendSearch from "./FriendSearch";
import { FaUserFriends } from "react-icons/fa";

interface FriendsButtonProps {
  user: User | null;
}

const FriendsButton: React.FC<FriendsButtonProps> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (
        !buttonRef.current?.contains(event.target as Node) &&
        !listRef.current?.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        className={`fixed bottom-20 right-4 md:bottom-12 md:right-12 text-white p-4 md:p-6 rounded-full cursor-pointer z-50 text-3xl md:text-4xl ${
          isExpanded ? 'bg-green-400' : 'bg-green-500'
        }`}
      >
        <FaUserFriends />
      </div>
      {isExpanded && (
        <aside
          ref={listRef}
          className="fixed top-16 md:top-24 bottom-0 right-0 bg-green-100 transition-all duration-300 w-4/5 md:w-1/3 h-3/4 md:h-screen z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-6 relative">
            <FriendSearch user={user} />
            <FriendsList user={user} />
          </div>
        </aside>
      )}
    </>
  );
};

export default FriendsButton;