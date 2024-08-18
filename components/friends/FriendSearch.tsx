"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface SearchResult {
  id: string;
  username: string;
}

const FriendSearch: React.FC<{ user: User | null }> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const supabase = createClient();

  const handleSearch = async (term: string) => {
    if (!user || term.trim() === "") {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${term}%`)
      .neq("id", user.id)
      .limit(10);

    if (error) {
      console.error("検索エラー:", error);
      return;
    }

    setSearchResults(data || []);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const sendFriendRequest = async (recipientId: string) => {
    if (!user) return;

    const { error } = await supabase.from("friends").insert({
      requester_id: user.id,
      recipient_id: recipientId,
      status: "pending",
    });

    if (error) {
      console.error("フレンドリクエスト送信エラー:", error);
      alert("フレンドリクエストの送信に失敗しました。");
    } else {
      alert("フレンドリクエストを送信しました。");
    }
  };

  if (!user) {
    return <div>ログインしてください。</div>;
  }

  return (
    <div className="mt-2">
      <div className="mb-4 shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 フレンド追加、ユーザー名を入力"
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <ul>
        {searchResults.map((result) => (
          <li key={result.id} className="flex justify-between items-center mb-2 bg-white">
            <span>{result.username}</span>
            <button
              onClick={() => sendFriendRequest(result.id)}
              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
            >
              + 追加
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSearch;