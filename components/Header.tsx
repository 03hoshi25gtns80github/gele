"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileNav from "./MobileNav";

interface HeaderProps {
  id: string | null;
}

const WELCOME_MESSAGE = "ようこそ！ gele-plus へ！";

const Header: React.FC<HeaderProps> = ({ id }) => {
  const supabase = createClient();
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  const handleViewCalendar = async (id: string) => {
    if (!id) return;

    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("フレンド情報取得エラー:", error);
      return;
    }

    if (user?.id === id) {
      router.push("/my-calendar");
    } else {
      const friendUserId = id;
      router.push(`/friend-calendar?friend=${friendUserId}`);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setUsername(data?.username);
          if (data?.avatar_url) {
            try {
              const { data: downloadData, error: downloadError } = await supabase
                .storage
                .from('avatars')
                .download(data.avatar_url);

              if (downloadError) {
                throw downloadError;
              }

              const url = URL.createObjectURL(downloadData);
              setAvatarUrl(url);
            } catch (error) {
              console.error("Error downloading image: ", error);
              setAvatarUrl(null);
            }
          } else {
            setAvatarUrl(null);
          }
        }
      } else {
        setUsername(null);
        setAvatarUrl(null);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkUser();
  }, []);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 p-2 shadow-lg w-full z-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center bg-white rounded-full ml-0 md:ml-4 shadow-md">
            {avatarUrl && (
              <div className="ml-2 border-4 border-gray-400 p-1 rounded-full">
                <Image
                  src={avatarUrl}
                  alt="User Avatar"
                  width={55}
                  height={55}
                  className="rounded-full shadow-lg md:w-16 md:h-16"
                />
              </div>
            )}
            <div className="text-blue-900 text-2xl md:text-3xl font-bold ml-1 mr-2 md:ml-4 md:mr-2">
              <button onClick={() => id && handleViewCalendar(id)}>
                {username ? `${username}'s カレンダー` : WELCOME_MESSAGE}
              </button>
            </div>
          </div>
          {isLoggedIn && (
            <nav className="hidden md:flex space-x-6">
              <ul className="flex space-x-6 text-sm md:text-base">
                <li>
                  <Link
                    href="/my-calendar"
                    className="font-bold text-blue-900 hover:text-blue-600 transition duration-300"
                  >
                    マイカレンダー
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="font-bold text-blue-900 hover:text-blue-600 transition duration-300"
                  >
                    プロフィール更新
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="font-bold text-blue-900 hover:text-blue-600 transition duration-300"
                  >
                    設定
                  </Link>
                </li>
                <li>
                  <form action="/auth/signout" method="post" className="inline">
                    <button
                      className="font-bold text-blue-900 hover:text-blue-600 transition duration-300"
                      type="submit"
                    >
                      ログアウト
                    </button>
                  </form>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>
      {isLoggedIn && <MobileNav />} {/* モバイルナビゲーションを追加 */}
    </>
  );
};

export default Header;