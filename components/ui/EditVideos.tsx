"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";

interface EditVideosProps {
  title: string;
  memo: string;
  onSave: () => void;
  onClose: () => void;
  setEditedTitle: (title: string) => void;
  setEditedMemo: (memo: string) => void;
}

const EditVideos: React.FC<EditVideosProps> = ({
  title,
  memo,
  onSave,
  onClose,
  setEditedTitle,
  setEditedMemo,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-49">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">編集</h2>
          <FaTimes className="text-2xl cursor-pointer" onClick={onClose} />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-bold mb-2 w-full border border-gray-300 dark:bg-gray-600 dark:border-gray-600 p-2 rounded"
        />
        <textarea
          value={memo}
          onChange={(e) => setEditedMemo(e.target.value)}
          className="w-full mb-2 border border-gray-300 dark:bg-gray-600 dark:border-gray-600 p-2 rounded"
        />
        <button onClick={onSave} className="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          保存
        </button>
      </div>
    </div>
  );
};

export default EditVideos;
