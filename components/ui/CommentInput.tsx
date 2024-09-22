"use client";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaPaperPlane } from "react-icons/fa";

interface CommentInputProps {
  onSubmit: (comment: string) => void;
  isSubmitting: boolean;
}

const CommentInput = forwardRef<{ setReplyTo: (username: string) => void }, CommentInputProps>(
  ({ onSubmit, isSubmitting }, ref) => {
    const [newComment, setNewComment] = useState<string>("");

    useImperativeHandle(ref, () => ({
      setReplyTo: (username: string) => {
        setNewComment(`@${username} `);
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() === "") return;
      onSubmit(newComment);
      setNewComment("");
    };

    return (
      <form onSubmit={handleSubmit} className="mb-2 flex">
        <textarea
          id="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力"
          disabled={isSubmitting}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          rows={1}
          style={{
            height: `${Math.min(newComment.split("\n").length + 1, 4) * 1.3}em`,
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`m-2 p-2 rounded w-11 h-8 ${
            isSubmitting 
              ? "bg-gray-300 dark:bg-gray-600" 
              : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
          } text-white flex justify-center items-center transition duration-150 ease-in-out`}
        >
          <FaPaperPlane />
        </button>
      </form>
    );
  }
);

CommentInput.displayName = "CommentInput";

export default CommentInput;
