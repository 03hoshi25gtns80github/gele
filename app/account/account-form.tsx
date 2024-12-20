"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Avatar from "./avatar";
import Spinner from "@/components/form/Spinner";

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [code_name, setCodeName] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, code_name, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error) {
        if (status === 406) {
          // データが見つからない場合は、新しいプロフィールを作成
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user?.id,
            username: null,
            code_name: null,
            avatar_url: null,
          });
          if (insertError) throw insertError;
        } else {
          throw error;
        }
      }

      if (data) {
        setUsername(data.username);
        setCodeName(data.code_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("プロフィールの読み込み中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    username,
    code_name,
    avatar_url,
  }: {
    username: string | null;
    code_name: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        username,
        code_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden p-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">プロフィール編集</h2>
      
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
        <div className="flex justify-center md:justify-start">
          <Avatar
            uid={user?.id ?? null}
            url={avatar_url}
            size={150}
            onUpload={(url) => {
              setAvatarUrl(url);
              updateProfile({ username, code_name, avatar_url: url });
            }}
          />
        </div>

        <div className="flex-grow space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              ユーザー名(半角英字)
            </label>
            <input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="code_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              コードネーム(半角英字)
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              チームでの呼ばれ方をローマ字で入力してください。
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              映像の仕分けに利用されます。
            </p>
            <input
              id="code_name"
              type="text"
              value={code_name || ""}
              onChange={(e) => setCodeName(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className="w-full md:w-auto md:min-w-[200px] flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
          onClick={() => updateProfile({ username, code_name, avatar_url })}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Spinner className="mr-2" />
              更新中...
            </span>
          ) : (
            "プロフィールを更新"
          )}
        </button>
      </div>
    </div>
  );
}