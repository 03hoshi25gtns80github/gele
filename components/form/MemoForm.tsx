"use client";
import React, { useState } from "react";

interface MemoFormProps {
  onMemoChange: (memo: string) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ onMemoChange }) => {
  const [memo, setMemo] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemo(event.target.value);
    onMemoChange(event.target.value);
  };

  return (
    <div>
      <label>メモ:</label>
      <input type="text" value={memo} onChange={handleChange} />
    </div>
  );
};

export default MemoForm;
