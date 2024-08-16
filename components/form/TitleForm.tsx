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
    <div>
      <label>タイトル:</label>
      <input type="text" value={title} onChange={handleChange} />
    </div>
  );
};

export default TitleForm;