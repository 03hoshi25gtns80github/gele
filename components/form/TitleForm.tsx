"use client";
import React, { useState } from "react";

interface TitleFormProps {
  onTitleChange: (title: string) => void;
}

const TitleForm: React.FC<TitleFormProps> = ({ onTitleChange }) => {
  const [title, setTitle] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    onTitleChange(event.target.value);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="title"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        タイトル
      </label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        placeholder="タイトルを入力してください"
      />
    </div>
  );
};

export default TitleForm;
