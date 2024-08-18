"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); //デフォルトでたたむならtrue

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(false); // マウスが離れたらサイドバーを閉じる場青はtrueにする
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX > 256) {
        setIsCollapsed(false); // マウスが離れたらサイドバーを閉じる場合はtrueにする
      }
    };

    if (!isCollapsed) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isCollapsed]);

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed font-bold top-5 left-6 bg-indigo-500 text-white p-3 rounded-full cursor-pointer z-50 text-2xl"
      >
        gele-ch
      </div>
      <aside
        className={`bg-gray-200 fixed top-0 z-20 transition-all duration-300 ${
          isCollapsed ? "-left-64" : "left-0"
        } w-55 h-screen`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-6 relative mt-20">
          {" "}
          {/* mt-20でgele-chのボックスの下に配置 */}
          <nav>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/my-calendar"
                  className="font-bold block hover:bg-blue-400 text-black p-2 rounded"
                >
                  マイカレンダー
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="font-bold block hover:bg-blue-400 text-black p-2 rounded"
                >
                  プロフィール更新
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="font-bold block hover:bg-blue-400 text-black p-2 rounded"
                >
                  設定
                </Link>
              </li>
              <li>
                <div className="font-bold block hover:bg-blue-400 text-black p-2 rounded">
                  <form action="/auth/signout" method="post">
                    <button className="button block" type="submit">
                      ログアウト
                    </button>
                  </form>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
