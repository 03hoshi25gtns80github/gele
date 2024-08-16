"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaPaperPlane } from "react-icons/fa"; // アイコンをインポート

interface CommentProps {
  videoId: string;
}

interface Comment {
  id: string;
  video_id: string;
  comment: string;
  created_at: string;
}

const Comment = ({ videoId }: CommentProps) => {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

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

  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert([{ video_id: videoId, comment: newComment }]);

    if (error) {
      console.error("Error adding comment: ", error);
    } else if (data) {
      setComments([data[0], ...comments]);
    }
    setIsSubmitting(false);
    setNewComment(""); // 送信完了後にリセットしないとうまくいかない
  };

  return (
    <div className="bg-white p-4 rounded">
      <form onSubmit={handleCommentSubmit} className="mb-2 flex">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力"
          disabled={isSubmitting}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`m-2 p-2 rounded w-11 ${isSubmitting ? "bg-gray-300" : "bg-blue-500"} text-white flex justify-center items-center`}
        >
          <FaPaperPlane />
        </button>
      </form>
      <div className="bg-gray-100 p-2 rounded shadow-md">
        {comments.length === 0 ? (
          <p>まだコメントがありません</p>
        ) : (
          <>
            <div
              key={comments[0].id}
              className="mb-2 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <p>{comments[0].comment}</p>
              <small>{formatTimeAgo(comments[0].created_at)}</small>
              {comments.length > 1 && (
                <p className="text-gray-600 ">
                  {isCollapsed ? "コメントを表示" : "コメントを隠す"}
                </p>
              )}
            </div>
            {!isCollapsed &&
              comments.slice(1).map((comment) => (
                <div key={comment.id} className="mb-2">
                  <p>{comment.comment}</p>
                  <small>{formatTimeAgo(comment.created_at)}</small>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;