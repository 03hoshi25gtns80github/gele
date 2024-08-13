"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
    <div>
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </form>
      <div>
        {comments.length === 0 ? (
          <p>まだコメントがありません</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.comment}</p>
              <small>{formatTimeAgo(comment.created_at)}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comment;