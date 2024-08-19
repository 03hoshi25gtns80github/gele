"use client";
import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

interface CommentInputProps {
  onSubmit: (comment: string) => void;
  isSubmitting: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [newComment, setNewComment] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newComment);
    setNewComment(""); // Reset after submission
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2 flex">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="コメントを入力"
        disabled={isSubmitting}
        className="border p-2 rounded w-full resize-none"
        rows={1}
        style={{
          height: `${Math.min(newComment.split("\n").length + 1, 4) * 1.3}em`,
        }}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className={`m-2 p-2 rounded w-11 h-8 ${
          isSubmitting ? "bg-gray-300" : "bg-blue-500"
        } text-white flex justify-center items-center`}
      >
        <FaPaperPlane />
      </button>
    </form>
  );
};

export default CommentInput;
