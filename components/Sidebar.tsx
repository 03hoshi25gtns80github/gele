"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsCollapsed(true);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX > 256) {
        setIsCollapsed(true);
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
        className="fixed top-6 left-6 bg-blue-500 text-white p-3 rounded-full cursor-pointer z-50 text-2xl"
      >
        gele-ch
      </div>
      <aside
        className={`bg-blue-400 fixed top-0 transition-all duration-300 ${
          isCollapsed ? "-left-64" : "left-0"
        } w-55 h-screen`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 relative mt-20">
          {" "}
          {/* mt-16でgele-chのボックスの下に配置 */}
          <nav>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/account"
                  className="block hover:bg-blue-700 text-white p-2 rounded"
                >
                  プロフィール更新
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="block hover:bg-blue-700 text-white p-2 rounded"
                >
                  設定
                </Link>
              </li>
              <li>
                <div className="block hover:bg-blue-700 text-white p-2 rounded">
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
