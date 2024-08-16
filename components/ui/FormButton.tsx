"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

const FormButton: React.FC = () => {
  const router = useRouter();

  const redirectToForm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    if (date) {
      router.push(`/form?date=${date}`);
    } else {
      console.error('Date parameter is missing in the URL');
    }
  };

  return (
    <div className="fixed bottom-36 right-12">
      <button
        onClick={redirectToForm}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-6 rounded-full shadow-lg"
      >
        <FaPlus size={32} />
      </button>
    </div>
  );
};

export default FormButton;