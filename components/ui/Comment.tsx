"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentInput from "./CommentInput";
import { FaEllipsisV } from "react-icons/fa";

interface CommentProps {
  videoId: string;
}

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

const Comment = ({ videoId }: CommentProps) => {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) {
      return "今";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}時間前`;
    }
  };

  const truncateComment = (comment: string, maxLength: number) => {
    if (comment.length <= maxLength) return comment;
    return comment.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username)")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments: ", error);
      } else {
        setComments(data || []);
      }
    }

    fetchComments();
  }, [videoId, isSubmitting, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = async (comment: string) => {
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase.from("comments").insert([
      {
        video_id: videoId,
        comment: comment,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error adding comment: ", error);
    } else if (data) {
      setComments([data[0], ...comments]);
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    console.log("Deleting comment with ID:", commentId); // Added: log commentId
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment: ", error);
    } else {
      setComments(comments.filter((comment) => comment.id !== commentId));
    }
  };

  return (
    <div className="bg-white p-4 rounded">
      <CommentInput
        onSubmit={handleCommentSubmit}
        isSubmitting={isSubmitting}
      />
      <div className="bg-gray-100 p-2 rounded shadow-md">
        {comments.length === 0 ? (
          <p>まだコメントがありません</p>
        ) : (
          <>
            <div
              key={comments[0].id}
              className="relative"
            >
              <p>
                {isCollapsed
                  ? truncateComment(comments[0].comment, 12)
                  : comments[0].comment}
              </p>
              <small>
                {formatTimeAgo(comments[0].created_at)} -{" "}
                {comments[0].profiles.username}
              </small>
              <div className="absolute top-0 right-[-9px]" ref={menuRef}>
                <button
                  onClick={() =>
                    setMenuOpenId(
                      menuOpenId === comments[0].id ? null : comments[0].id
                    )
                  }
                  className="mt-1"
                >
                  <FaEllipsisV />
                </button>
                {menuOpenId === comments[0].id && (
                  <div
                    className="absolute right-4 w-12 bg-red-500 border rounded shadow-lg z-50"
                    ref={menuRef}
                  >
                    <button
                      onClick={() => {
                        handleDeleteComment(comments[0].id);
                      }}
                      className="block w-full text-left px-2 py-2 text-sm text-white hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
              {comments.length > 1 && (
                <p 
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? "コメントを表示" : "コメントを隠す"}
                </p>
              )}
            </div>
            {!isCollapsed &&
              comments.slice(1).map((comment) => (
                <div key={comment.id} className="relative">
                  <p>{comment.comment}</p>
                  <small>
                    {formatTimeAgo(comment.created_at)} -{" "}
                    {comment.profiles.username}
                  </small>
                  <div className="absolute top-0 right-[-9px]" ref={menuRef}>
                    <button
                      onClick={() =>
                        setMenuOpenId(
                          menuOpenId === comment.id ? null : comment.id
                        )
                      }
                      className="mt-1"
                    >
                      <FaEllipsisV />
                    </button>
                    {menuOpenId === comment.id && (
                      <div
                        className="absolute right-4 w-12 bg-red-500 border rounded shadow-lg z-50"
                        ref={menuRef}
                      >
                        <button
                          onClick={() => {
                            handleDeleteComment(comment.id);
                          }}
                          className="block w-full text-left px-2 py-2 text-sm text-white hover:bg-red-100"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;