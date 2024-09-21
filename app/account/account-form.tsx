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
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">プロフィール編集</h2>
      <div className="flex items-start space-x-6">
        <div className="relative">
          <Avatar
            uid={user?.id ?? null}
            url={avatar_url}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
              updateProfile({ username, code_name, avatar_url: url });
            }}
          />
        </div>
        <div className="flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ユーザー名(半角英字)
              </label>
              <input
                id="username"
                type="text"
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div>
              <label
                htmlFor="code_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                コードネーム(半角英字)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                チームでの呼ばれ方をローマ字で入力してください。映像の仕分けに利用されます。
              </p>
              <input
                id="code_name"
                type="text"
                value={code_name || ""}
                onChange={(e) => setCodeName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-800"
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