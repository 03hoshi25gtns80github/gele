"use client";
import React, { useState } from "react";

interface TargetMemberProps {
  onUserInputChange: (inputs: string[]) => void;
}

const TargetMember: React.FC<TargetMemberProps> = ({ onUserInputChange }) => {
  const [userInputs, setUserInputs] = useState<string[]>([""]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
    onUserInputChange(newInputs);
  };

  const addInputField = () => {
    setUserInputs([...userInputs, ""]);
  };

  const removeInputField = (index: number) => {
    const newInputs = userInputs.filter((_, i) => i !== index);
    setUserInputs(newInputs);
    onUserInputChange(newInputs);
  };

  return (
    <div className="mb-4">
      <label htmlFor="targetMember" className="block text-sm font-medium text-gray-700 mb-1">
        ターゲットメンバー
      </label>
      {userInputs.map((input, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder="ユーザー入力をここに入力してください"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
          />
          {index > 0 && (
            <button
              onClick={() => removeInputField(index)}
              className="ml-2 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out"
            >
              -
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addInputField}
        className="mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
      >
        +
      </button>
    </div>
  );
};

export default TargetMember;
