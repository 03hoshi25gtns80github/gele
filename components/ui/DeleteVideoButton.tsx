"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

interface DeleteVideoButtonProps {
  videoId: string;
  userId: string;
}

const DeleteVideoButton = ({ videoId, userId }: DeleteVideoButtonProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabase = createClient();
  const confirmRef = useRef<HTMLDivElement>(null);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }
      window.location.reload(); // ページを更新
    } catch (error) {
      console.error("Error deleting video: ", error);
      alert("Failed to delete video");
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
      setConfirmDelete(false);
    }
  };

  useEffect(() => {
    if (confirmDelete) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmDelete]);

  return (
    <>
      {confirmDelete ? (
        <div ref={confirmRef} className="bg-red-100 dark:bg-gray-700 p-4 rounded-md shadow-lg mt-8">
          <p className="text-lg font-semibold mb-4">本当に消去しますか？</p>
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 w-20"
            >
              はい
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-500 w-20"
            >
              いいえ
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrashAlt className="text-2xl" />
        </button>
      )}
    </>
  );
};

export default DeleteVideoButton;