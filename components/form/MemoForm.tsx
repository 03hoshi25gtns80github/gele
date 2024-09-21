"use client";
import React, { useState } from "react";

interface MemoFormProps {
  onMemoChange: (memo: string) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ onMemoChange }) => {
  const [memo, setMemo] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(event.target.value);
    onMemoChange(event.target.value);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="memo"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        メモ
      </label>
      <textarea
        id="memo"
        value={memo}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        rows={4}
        placeholder="メモを入力してください"
      />
    </div>
  );
};

export default MemoForm;
